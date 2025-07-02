#! /bin/bash

# Start local server in either dev or prod mode
set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

APP_DIR="app/cork-icon-local-dev"
cd $APP_DIR

if [[ "$1" == "dev" ]]; then
  echo "Starting local server in development mode..."
  docker compose exec app bash -c 'cd app/src && npm run dev-server'
else
  echo "Starting local server in production mode..."
  docker compose exec app bash -c 'cd app/src && npm run prod-server'
fi
