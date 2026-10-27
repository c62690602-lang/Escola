#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Escola
export npm_config_cache=/workspace/.npm-cache
npm ci --no-audit --no-fund
if [ ! -f .env.local ]; then
  umask 077
  printf '%s\n' 'DATABASE_URL=postgresql://nexo:nexo_local_development@127.0.0.1:5432/nexo' 'DEMO_MODE=true' > .env.local
fi
fresh_database=false
if docker container inspect nexo-postgres >/dev/null 2>&1; then
  docker start nexo-postgres >/dev/null
else
  docker compose up -d db
  fresh_database=true
fi
for attempt in $(seq 1 30); do
  if docker exec nexo-postgres pg_isready -U nexo >/dev/null; then break; fi
  if [ "$attempt" = 30 ]; then exit 1; fi
  sleep 1
done
if [ "$fresh_database" = true ] && [ -s .local/nexo.dump ]; then
  docker exec -i nexo-postgres pg_restore -U nexo -d nexo --no-owner --exit-on-error < .local/nexo.dump
fi
# Local dotenv is loaded by Node without exposing its contents.
node --env-file=.env.local --import tsx scripts/migrate.ts
