#!/usr/bin/env bash
# ONE-TIME migration: converts DataExFrontend from a plain directory into a
# symlink pointing at releases/<name>/, with .env moved to a shared/ folder
# outside of any release. Run this by hand over SSH, once, before the new
# GitHub Actions workflow's first deploy.
#
# Safe to re-run: it no-ops if DataExFrontend is already a symlink.
#
# Usage: bash ec2-migrate-to-releases.sh

set -euo pipefail

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

if [ -f "$LEGACY_PATH/.env" ]; then
  echo "Moving .env -> $SHARED_DIR/.env"
  mv "$LEGACY_PATH/.env" "$SHARED_DIR/.env"
else
  echo "WARNING: no .env found in the old app directory. If runtime env comes from" >&2
  echo "somewhere else (e.g. PM2 env, /etc/environment), create $SHARED_DIR/.env yourself" >&2
  echo "with the same contents before deploying, or the app will start with no config." >&2
fi

ln -s "$SHARED_DIR/.env" "$LEGACY_PATH/.env"

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
echo "Verify the site manually before merging/pushing the new GitHub Actions workflow."
