# 🚀 Deploy Pipeline — Releases/Rollback Architecture

How `deploy-Dataspace.yml` deploys to EC2, what changed from the old
in-place-swap deploy, and every bug found while getting it actually working
end-to-end on `dev`. Written as a handover — the point is what to check if
this breaks again, not just what the code does today.

---

## 0. What changed and why

The old deploy did an in-place swap: build in CI, `scp` `.next`/`public`
straight into the live `DataExFrontend` directory, delete the old ones,
restart PM2. If the build was subtly broken (wrong dependency version,
missing runtime file), there was no way to know until users hit errors —
and no way back except a manual SSH fix.

The new deploy (branch `ci/release-rollback-quality-gate`, merged to `dev`
as PR #441) uses a `releases/<timestamp-sha>/` + symlink layout instead:

```
DataExchange/
├── DataExFrontend -> releases/<current-release>/   (symlink, flipped atomically)
├── releases/
│   ├── <release-1>/
│   ├── <release-2>/
│   ├── .last_good           (name of the last release that passed its gate)
│   └── .rollback_target     (what to revert to if *this* deploy fails)
└── shared/
    └── .env.local           (runtime secrets, outside any release, symlinked in)
```

Each deploy: builds in CI → ships a `release.tar.gz` → extracts into a
**brand-new** `releases/<release>/` directory → installs deps and verifies
the Next.js version **there** (never touching the currently-live release) →
flips the `DataExFrontend` symlink → runs a boot health check
(`curl 127.0.0.1:3000`, 10 attempts) → **rolls back automatically** if that
fails.

On `dev` only: `smoke-tests` (via `CivicDataLab/CivicDataSpace-test`) is a
real deploy gate now, not just an FYI job — `promote-dev` marks a release
`.last_good` only after smoke tests pass; `rollback-dev` reverts to
`.last_good` if they fail. Production has no smoke-test job yet, so its
only gate is the boot health check.

`deploy/ec2-migrate-to-releases.sh` is the one-time manual migration each
EC2 box needs before its first deploy under this workflow — converts a
plain `DataExFrontend` directory into the symlink layout above.

---

## 1. Status per environment (as of 2026-08-27)

| | Node 24.13.0 (nvm) | Migrated to releases/ layout | Workflow validated live |
|---|---|---|---|
| **dev** (`dev-cds`) | ✅ | ✅ | ✅ — full green run, all 6 bugs below fixed |
| **prod** (`prod-cds`) | ❌ only v20.11.1 | ❌ still a plain directory | Not attempted |

**Do not merge this workflow's behavior onto `main` until prod has Node
v24.13.0 installed via nvm and the migration script has been run there.**
Per explicit instruction, prod is user-only — never SSH into or modify
`prod-cds` without being asked again for that specific action, even for
something that "worked fine on dev."

---

## 2. Every bug found — all discovered by actually running the pipeline,
not by reading the YAML. Fixed in this order, each confirmed with a live
deploy before moving to the next:

### 2.1 Wrong secrets file: `.env` vs `.env.local`
The workflow (and migration script) originally assumed the app's runtime
secrets lived in `shared/.env`. Confirmed via `pm2 env` on `dev-cds` that
the real file is `.env.local`, living **inside** `DataExFrontend` itself —
the `.env` one level up in `~/DataExchange/` belongs to a separate
docker-compose stack (DataExAuth/DataExBackend/DataExKeycloak), not this
Next.js app. Fixed before the first real deploy attempt.

### 2.2 Merge conflict: `npm ci` vs plain `npm install`
`dev` moved 26 commits ahead while this branch was open. One real
conflict: a teammate's unrelated cleanup simplified the install step back
to plain `npm install`, while this branch introduced `npm ci
--legacy-peer-deps` + a guard that aborts if the installed Next.js version
drifts from `package.json` (the whole reason this rework exists — a prior
incident let a canary Next version get silently resolved). Resolved in
favor of `npm ci` + the guard, since it's a strict superset.

### 2.3 nvm/PATH resolution over non-interactive SSH
**Symptom:** `Error: Cannot find module 'node:path'` when running `npm ci`
on the server, with an old-style stack trace (`internal/modules/cjs/loader.js`).

**Root cause:** `npm`/`pm2` are both scripts with a `#!/usr/bin/env node`
shebang. The script invoked them by absolute path
(`$NODE_BIN/npm`), which is correct — but the OS still re-resolves `node`
via the shebang, through `$PATH`. `appleboy/ssh-action`'s non-interactive
shell never sources `~/.bashrc`/nvm, so `$PATH` there is the bare system
default, and `env node` picks the ancient system Node v10 instead of the
v24.13.0 nvm install. v10 can't parse npm v24's `node:`-scheme imports.

**Fix:** `export PATH="$NODE_BIN:$PATH"` before any npm/pm2 invocation, in
both the deploy workflow (activation step, `rollback-dev`) and the
migration script.

### 2.4 Missing `env.ts` in the release artifact
**Symptom:** deploy activated, but the app crash-looped:
`Failed to load next.config.mjs ... Cannot find module './env'`. The boot
health check correctly caught this and auto-rolled back — **zero
downtime**, this is the safety mechanism working exactly as designed.

**Root cause:** `next.config.mjs` does `jiti('./env')` — this runs
**synchronously on every `next start` boot**, not just at build time, so
`env.ts` has to physically exist on disk in the release directory. The
"Package release artifact" step's `tar` command only included `.next
public package.json package-lock.json next.config.mjs` — no `env.ts`.

`next.config.mjs` also references `./i18n.ts`, but only as a build-time
webpack alias target for `next-intl` — already resolved into `.next`'s
bundled output during `npm run build`, so it does *not* need to ship
standalone (confirmed: the crash trace only ever mentioned `env.ts`).

**Fix:** added `env.ts` to the tar command.

### 2.5 False-negative failure in release-pruning cleanup
**Symptom:** the app deployed successfully and passed its health check
(log literally said "Release ... is live and passed the boot health
check"), but GitHub Actions still reported the whole step — and job — as
**failed**.

**Root cause:** the cleanup line that prunes old releases —
`ls -1dt */ | tail -n +6 | grep -v "^${PREVIOUS}/$" | xargs -r rm -rf` —
uses `grep -v`, which exits with status `1` whenever it selects zero
lines. That happens any time there are fewer than 6 releases to prune
(true for a freshly migrated box). Under `set -o pipefail`, that non-zero
code kills the script right after printing the success message. Because
`build-and-deploy` was marked failed, `smoke-tests`/`promote-dev` never
even ran (their `needs:` chain requires it to succeed) — despite the site
being genuinely healthy and serving traffic the whole time.

**Fix:** append `|| true` — pruning old releases is best-effort
housekeeping and should never be able to fail the deploy.

### 2.6 `promote-dev`/`rollback-dev` missing `environment: development`
**Symptom:** `build-and-deploy` and all three smoke-test suites passed,
but `promote-dev` still failed: `Error: missing server host`.

**Root cause:** `vars.EC2_HOST` is an **environment-scoped** GitHub
Actions variable (Settings → Environments → development), only visible to
a job that declares `environment:`. `build-and-deploy` has
`environment: ${{ github.ref_name == 'main' && 'production' ||
'development' }}`; `promote-dev` and `rollback-dev` never declared one at
all, so `vars.EC2_HOST` silently resolved to an empty string for them.
(A VS Code GitHub Actions extension diagnostic flagged this ahead of time
— "Context access might be invalid: EC2_HOST" — initially dismissed as
cosmetic since `actionlint` passed clean; it was a real, valid warning.)

**Fix:** added `environment: development` to both jobs — a fixed value
rather than `build-and-deploy`'s ternary, since both are already gated by
`if: github.ref_name == 'dev'`.

---

## 3. What this proves about the safety design

Bugs 2.4, 2.5, and 2.6 all surfaced on **live deploys to dev** — and in
every case except 2.5/2.6 (which are false-negative *reporting* bugs, not
actual app breakage), the boot health check + auto-rollback correctly
protected the site. `dev.civicdataspace.in` never went down while any of
this was being debugged. That's the actual point of the releases/symlink
rework — not that bugs won't happen, but that they fail safely when they
do.

---

## 4. Before rolling this out to `main`/prod

- [ ] Install Node v24.13.0 via nvm on `prod-cds` (**user-only action**)
- [ ] Run `deploy/ec2-migrate-to-releases.sh` on `prod-cds` (**user-only
      action**) — verify the site AND Keycloak login manually afterward,
      per the script's own final message
- [ ] Confirm `shared/.env.local` on `prod-cds` has the right contents
      after migration (mirrors the dev discovery in §2.1 — don't assume)
- [ ] Note: production has no `smoke-tests`/`promote-dev`/`rollback-dev`
      equivalent — its only gate is the boot health check. Consider
      whether prod should get a smoke-test gate too before relying on this
      for production deploys
- [ ] Re-run through this doc's bug list once on a real prod deploy
      attempt — the environment-scoped `vars.EC2_HOST` issue in particular
      (§2.6) only affects `dev`'s jobs today, but any future prod-specific
      job added here needs the same `environment:` declaration

---

## 5. Verifying nothing leaked in the meantime

Every run during this debugging pulled full logs and grepped for exposed
secrets, private key material, and `.env`/`.env.local` dumps — none found.
GitHub Actions' secret masking held throughout (`KEYCLOAK_CLIENT_SECRET`,
`NEXTAUTH_SECRET`, `EC2_PRIVATE_KEY`, `EC2_USERNAME`, test passwords all
consistently `***` in every step). Worth re-checking the same way after
any future change to this workflow, especially one that adds new
`echo`/debug output to the SSH scripts.
