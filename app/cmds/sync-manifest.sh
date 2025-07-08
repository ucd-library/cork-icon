#! /bin/bash

echo "Syncing manifest file with the latest iconsets in the Google Cloud bucket..."

# syncs manifest file with the latest iconsets in the Google Cloud bucket
# This script should be run after uploading new iconsets to the bucket
set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

APP_DIR="app/cork-icon-local-dev"
cd $APP_DIR

docker compose exec app bash -c 'node ./src/bin/sync-manifest.js'
