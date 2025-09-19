#! /bin/bash

# Watch js code and rebuild

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

APP_DIR="app/cork-icon-local-dev"
cd "$APP_DIR" && docker compose exec app bash -c 'cd app/src && npm run build-client'
