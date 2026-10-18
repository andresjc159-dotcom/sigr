#!/usr/bin/env bash
# Wrapper de Docker Compose para el despliegue de Red Velvet en AWS.
# Siempre usa el compose de AWS y el archivo de secretos .env.aws.
#
#   ./deploy-aws.sh up -d --build
#   ./deploy-aws.sh exec rv_api node seed-full.js
#   ./deploy-aws.sh logs -f rv_api
#   ./deploy-aws.sh ps
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env.aws ]]; then
  echo "ERROR: falta .env.aws. Cópialo y completa los secretos:" >&2
  echo "  cp .env.aws.example .env.aws" >&2
  exit 1
fi

exec docker compose --env-file .env.aws -f docker-compose.aws.yml "$@"
