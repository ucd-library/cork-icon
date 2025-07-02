#! /bin/bash

# Build the local development image

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

docker build -f app/Dockerfile -t localhost/local-dev/cork-icon .

ENV_FILE="./app/cork-icon-local-dev/.env"
if [ ! -f "$ENV_FILE" ]; then
  mkdir -p "$(dirname "$ENV_FILE")"
  touch "$ENV_FILE"
fi
