#! /bin/bash

# Create a new iconset for the cork-icon package

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$CMDS_DIR/../.."

if [ $# -ne 1 ]; then
  echo "Usage: $0 <iconset-name>"
  exit 1
fi

ICONSET_NAME="$1"

mkdir -p "io/gc-bucket/dist"

if [ -d "io/gc-bucket/$ICONSET_NAME" ]; then
  echo "Iconset '$ICONSET_NAME' already exists."
  exit 1
fi
mkdir -p "io/gc-bucket/$ICONSET_NAME/icons"
touch "io/gc-bucket/$ICONSET_NAME/metadata.json"

cat > "io/gc-bucket/$ICONSET_NAME/metadata.json" <<EOF
{
  "name": "$ICONSET_NAME",
  "label": "$ICONSET_NAME",
  "icons": []
}
EOF

echo "Template for iconset '$ICONSET_NAME' created successfully at 'io/gc-bucket/$ICONSET_NAME'."

