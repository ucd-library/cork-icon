#! /bin/bash

# Process a iconset in the app container
# Adds/removes icons, updates metadata file, and zips the iconset

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

if [ $# -ne 1 ]; then
  echo "Usage: $0 <iconset-name>"
  exit 1
fi

ICONSET_NAME="$1"
ICONSET_DIR="io/gc-bucket/iconsets/$ICONSET_NAME"
if [ ! -d "$ICONSET_DIR" ]; then
  echo "Iconset '$ICONSET_NAME' does not exist."
  exit 1
fi
APP_DIR="app/cork-icon-local-dev"

cd "$APP_DIR" && docker compose exec app node ./src/bin/process-custom.js "$ICONSET_NAME"
