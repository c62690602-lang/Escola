#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?Configure the private database connection}"
: "${DEMO_PASSWORD:?Configure the demonstration password in the hosting dashboard}"
if [ "${DEMO_MODE:-}" != true ] || [ "${PUBLIC_DEMO:-}" != true ]; then
  printf '%s\n' 'This startup script is only for the isolated online demonstration.' >&2
  exit 1
fi
if [ -z "${APP_ORIGIN:-${RENDER_EXTERNAL_URL:-}}" ]; then
  printf '%s\n' 'Configure APP_ORIGIN with the HTTPS demo origin.' >&2
  exit 1
fi
node --import tsx scripts/migrate.ts
node --import tsx scripts/seed.ts
exec npm run start -- -p "${PORT:-10000}"
