#! /bin/bash

# Upload iconset to google cloud bucket
set -e

if [ $# -ne 1 ]; then
  echo "Usage: $0 <iconset-directory>"
  exit 1
fi

ICONSET_DIR="$(realpath -- "$1")"
if [ ! -d "$ICONSET_DIR" ]; then
  echo "Iconset directory '$ICONSET_DIR' does not exist."
  exit 1
fi
echo "Found iconset directory: $ICONSET_DIR"

CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

isFa=false
if [ -d "$ICONSET_DIR/dist" ] && [ -d "$ICONSET_DIR/iconsets" ]; then
  isFa=true
fi

if [ "$isFa" = true ]; then
  if [ ! -d "$ICONSET_DIR/dist" ] || [ ! -d "$ICONSET_DIR/iconsets" ]; then
    echo "Error: FontAwesome iconset must contain both 'dist' and 'iconsets' directories."
    exit 1
  fi
  echo "Uploading iconset from FontAwesome format..."
  gsutil -m rsync -r "$ICONSET_DIR/dist" "gs://cork-icon/dist"
  gsutil -m rsync -r "$ICONSET_DIR/iconsets" "gs://cork-icon/iconsets"
else
if [ ! -f "$ICONSET_DIR/metadata.json" ]; then
  echo "Error: '$ICONSET_DIR' does not contain a metadata.json file."
  exit 1
fi
  echo "Uploading iconset from custom format..."
  gsutil -m rsync -r "$ICONSET_DIR" "gs://cork-icon/iconsets/$(basename "$ICONSET_DIR")"
  ZIP_NAME="$(basename "$ICONSET_DIR").zip"
  ZIP_PATH="$(dirname "$(dirname "$ICONSET_DIR")")/dist/$ZIP_NAME"
  if [ -f "$ZIP_PATH" ]; then
    gsutil cp "$ZIP_PATH" "gs://cork-icon/dist/$ZIP_NAME"
  else
    echo "Zip file '$ZIP_PATH' does not exist."
    exit 1
  fi

fi

echo "Iconset uploaded successfully."

# Update the manifest file
echo "Updating manifest file..."
./app/cmds/sync-manifest.sh
