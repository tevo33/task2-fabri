#!/usr/bin/env sh
set -eu

ENVIRONMENT="${1:-}"

if [ "$ENVIRONMENT" != "homolog" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Uso: ./scripts/deploy.sh homolog|prod"
  exit 1
fi

mkdir -p .deploy

if [ "$ENVIRONMENT" = "homolog" ]; then
  BRANCH="homolog"
else
  BRANCH="main"
fi

git fetch origin
git switch "$BRANCH"
git pull --ff-only origin "$BRANCH"
CURRENT_SHA="$(git rev-parse HEAD)"

docker_compose() {
  if docker info >/dev/null 2>&1; then
    docker compose "$@"
  else
    sudo docker compose "$@"
  fi
}

if [ "$ENVIRONMENT" = "prod" ]; then
  if [ ! -f .deploy/homolog.sha ]; then
    echo "Homologacao ainda nao foi atualizada nesta VM."
    exit 1
  fi

  HOMOLOG_SHA="$(cat .deploy/homolog.sha)"

  if ! git merge-base --is-ancestor "$HOMOLOG_SHA" "$CURRENT_SHA"; then
    echo "O commit homologado ainda nao foi mesclado na main."
    echo "homolog: $HOMOLOG_SHA"
    echo "main:    $CURRENT_SHA"
    exit 1
  fi
fi

docker_compose build "app-$ENVIRONMENT"
docker_compose up -d "db-$ENVIRONMENT"
docker_compose run --rm "app-$ENVIRONMENT" npm run migrate
docker_compose up -d "app-$ENVIRONMENT" nginx

printf "%s" "$CURRENT_SHA" > ".deploy/$ENVIRONMENT.sha"

echo "Ambiente $ENVIRONMENT atualizado em $CURRENT_SHA."
