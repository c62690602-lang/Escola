#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Escola
umask 077
mkdir -p .local
docker exec nexo-postgres pg_dump -U nexo -d nexo -Fc > .local/nexo.dump.tmp
mv .local/nexo.dump.tmp .local/nexo.dump
printf '%s\n' 'Backup privado atualizado em .local/nexo.dump'
