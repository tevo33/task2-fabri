#!/usr/bin/env sh
set -eu

ENVIRONMENT="${1:-}"

if [ "$ENVIRONMENT" != "homolog" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Uso: ./scripts/deploy.sh homolog|prod"
  exit 1
fi

mkdir -p .deploy

git pull --ff-only
CURRENT_SHA="$(git rev-parse HEAD)"

if [ "$ENVIRONMENT" = "prod" ]; then
  if [ ! -f .deploy/homolog.sha ]; then
    echo "Homologacao ainda nao foi atualizada nesta VM."
    exit 1
  fi

  HOMOLOG_SHA="$(cat .deploy/homolog.sha)"

  if [ "$HOMOLOG_SHA" != "$CURRENT_SHA" ]; then
    echo "Atualize homologacao antes de promover producao."
    echo "homolog: $HOMOLOG_SHA"
    echo "atual:   $CURRENT_SHA"
    exit 1
  fi
fi

docker compose build "app-$ENVIRONMENT"
docker compose up -d "db-$ENVIRONMENT"
docker compose run --rm "app-$ENVIRONMENT" npm run migrate
docker compose up -d "app-$ENVIRONMENT" nginx

printf "%s" "$CURRENT_SHA" > ".deploy/$ENVIRONMENT.sha"

echo "Ambiente $ENVIRONMENT atualizado em $CURRENT_SHA."
