#!/usr/bin/env bash
# ONE-TIME migration: converts DataExFrontend from a plain directory into a
# symlink pointing at releases/<name>/, with .env.local moved to a shared/
# folder outside of any release. Run this by hand over SSH, once, before the
# new GitHub Actions workflow's first deploy.
#
# NOTE: the runtime secrets file is .env.local (inside DataExFrontend itself),
# NOT the .env one level up in /home/ubuntu/DataExchange/ - that one belongs
# to the docker-compose stack (DataExAuth/DataExBackend/DataExKeycloak), not
# this Next.js app. Confirmed via `pm2 env` showing no secrets in PM2's own
# captured environment, and .env.local's size/presence matching
# .env.local.example.
#
# Safe to re-run: it no-ops if DataExFrontend is already a symlink.
#
# Usage: bash ec2-migrate-to-releases.sh

set -euo pipefail

# pm2 is a script with a `#!/usr/bin/env node` shebang, so invoking it by
# absolute path below is not enough on its own - env still re-resolves
# `node` via PATH. Meant to run interactively where nvm usually handles
# this, but exporting it explicitly here removes that assumption.
export PATH="/home/ubuntu/.nvm/versions/node/v24.13.0/bin:$PATH"

BASE="/home/ubuntu/DataExchange"
APP_DIR="$BASE/DataExFrontend"
RELEASES_DIR="$BASE/releases"
SHARED_DIR="$BASE/shared"

if [ -L "$APP_DIR" ]; then
  echo "DataExFrontend is already a symlink -> $(readlink -f "$APP_DIR"). Nothing to do."
  exit 0
fi

if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: $APP_DIR does not exist or is not a plain directory. Aborting." >&2
  exit 1
fi

mkdir -p "$RELEASES_DIR" "$SHARED_DIR"

LEGACY_NAME="legacy-$(date -u +%Y%m%d%H%M%S)"
LEGACY_PATH="$RELEASES_DIR/$LEGACY_NAME"

echo "Moving current $APP_DIR -> $LEGACY_PATH"
mv "$APP_DIR" "$LEGACY_PATH"

if [ -f "$LEGACY_PATH/.env.local" ]; then
  echo "Moving .env.local -> $SHARED_DIR/.env.local"
  mv "$LEGACY_PATH/.env.local" "$SHARED_DIR/.env.local"
else
  echo "WARNING: no .env.local found in the old app directory. If runtime env comes" >&2
  echo "from somewhere else, create $SHARED_DIR/.env.local yourself with the right" >&2
  echo "contents before deploying, or the app will start with no secrets configured." >&2
fi

ln -s "$SHARED_DIR/.env.local" "$LEGACY_PATH/.env.local"

echo "Creating symlink $APP_DIR -> $LEGACY_PATH"
ln -s "$LEGACY_PATH" "$APP_DIR"

echo "Marking this as the last-known-good release"
echo "$LEGACY_NAME" > "$RELEASES_DIR/.last_good"

echo "Restarting PM2 to confirm nothing broke (cwd resolves through the new symlink transparently)"
/home/ubuntu/.nvm/versions/node/v24.13.0/bin/pm2 restart dataspace

sleep 3
echo "Health check:"
curl -f http://127.0.0.1:3000 -o /dev/null -s -w "HTTP %{http_code}\n"

echo "Done. DataExFrontend now -> $(readlink -f "$APP_DIR")"
echo "Verify the site AND login (Keycloak auth) manually before pushing the new workflow."
