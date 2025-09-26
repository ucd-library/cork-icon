#! /bin/bash

# Convert font awesome package into cork-icon iconsets

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo "Usage: $0 <io-directory-name> [fa_version]"
  exit 1
fi

FA_DIR="io/$1"
if [ ! -d "$FA_DIR" ]; then
  echo "Directory '$FA_DIR' does not exist."
  exit 1
fi

if [ $# -ge 2 ]; then
  FA_VERSION="$2"
else
  FA_VERSION=""
fi

APP_DIR="app/cork-icon-local-dev"
cd "$APP_DIR" && docker compose exec app node ./src/bin/process-fa.js "/cork-icon/$FA_DIR" "$FA_VERSION"
