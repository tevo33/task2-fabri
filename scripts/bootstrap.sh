#!/usr/bin/env sh
set -eu

REPOSITORY_URL="${REPOSITORY_URL:-https://github.com/tevo33/task2-fabri.git}"
PROJECT_DIR="${PROJECT_DIR:-$HOME/task2-fabri}"

sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-v2
sudo systemctl enable --now docker

if [ -d "$PROJECT_DIR/.git" ]; then
  echo "Projeto ja existe em $PROJECT_DIR."
else
  git clone "$REPOSITORY_URL" "$PROJECT_DIR"
fi

chmod +x "$PROJECT_DIR/scripts/"*.sh

echo "Ferramentas e projeto instalados."
echo "Proximo passo: cd $PROJECT_DIR && ./scripts/deploy.sh homolog"
