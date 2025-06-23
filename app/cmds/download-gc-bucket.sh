#! /bin/bash

# Download iconset files from Google Cloud bucket
set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

if [ $# -ne 1 ]; then
  echo "Deleting local 'io/gc-bucket' directory if it exists..."
  if [ -d "io/gc-bucket" ]; then
    rm -rf "io/gc-bucket"
    echo "'io/gc-bucket' directory deleted."
  fi
  mkdir -p io/gc-bucket

  echo "Downloading iconset files from Google Cloud bucket..."
  gsutil -m cp -r "gs://cork-icon/dist" "io/gc-bucket/"
  gsutil -m cp -r "gs://cork-icon/iconsets" "io/gc-bucket/"
  echo "Iconset files downloaded successfully to 'io/gc-bucket'."
else
  ICONSET_NAME="$1"

  # delete the local iconset directory if it exists
  if [ -d "io/gc-bucket/iconsets/$ICONSET_NAME" ]; then
    echo "Deleting local 'io/gc-bucket/iconsets/$ICONSET_NAME' directory..."
    rm -rf "io/gc-bucket/iconsets/$ICONSET_NAME"
  fi
  mkdir -p "io/gc-bucket/iconsets/$ICONSET_NAME"

  # delete zip file if it exists
  ZIP_NAME="$(basename "$ICONSET_NAME").zip"
  ZIP_PATH="io/gc-bucket/dist/$ZIP_NAME"
  if [ -f "$ZIP_PATH" ]; then
    echo "Deleting local zip file '$ZIP_PATH'..."
    rm -f "$ZIP_PATH"
  fi

  echo "Downloading iconset '$ICONSET_NAME' from Google Cloud bucket..."
  gsutil -m cp -r "gs://cork-icon/iconsets/$ICONSET_NAME" "io/gc-bucket/iconsets/"
  gsutil cp "gs://cork-icon/dist/$ZIP_NAME" "io/gc-bucket/dist/"
  echo "Iconset '$ICONSET_NAME' downloaded successfully to 'io/gc-bucket/iconsets/$ICONSET_NAME'."
  echo "Zip file '$ZIP_NAME' downloaded successfully to 'io/gc-bucket/dist/'."
fi
