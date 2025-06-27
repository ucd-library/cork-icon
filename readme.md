# cork-icon (WIP)

This package allows you to use icons in any cork-app-utils application with the following features:
- Dynamically load only the icons you need in your SPA
- Seamlessly integrate custom icons with Font Awesome
- Easily share icons between projects
- Allow users to search for and select icons with a custom element
  
# Usage

## Updating Icons

All iconsets are stored in a [Google Cloud Storage bucket](https://console.cloud.google.com/storage/browser/cork-icon;tab=objects?project=digital-ucdavis-edu). This package downloads the zipped version of the iconsets from the `dist` directory.

### Adding an icon to an existing custom iconset
- Add the icon file to `gs://cork-icon/iconsets/<name-of-iconset>/icons` in digital-ucdavis-edu project
- Download latest version of iconset to your host machine with `./app/cmds/download-gc-bucket <name-of-iconset>`.
- Follow the instructions in **Updating Icons** section below

### Creating a new custom iconset
- Create the directory for your new iconset with `./app/cmds/create-iconset.sh <name-of-iconset>`, which will be placed in `./io/gc-bucket/iconsets/<name-of-iconset>`
- Place icons into the `icons` directory of your iconset
- Follow the instructions in **Updating Icons** section below

### Updating icons
- Follow all instructions in local development section
- Start demo app and bash into it - `docker compose up -d` `docker compose exec app bash`
- Update icon metadata file with `node ./src/bin/process-custom.js ./io/gc-bucket/iconsets/<name-of-iconset>/` from container
- Review the `metadata.json` file. Specifically, update the `label` and `searchTerms` properties for each icon to improve the icon search experience.
- If any changes are made to `metadata.json`, run the command again to ensure these are reflected in the zipped version: `node ./src/bin/process-custom.js ./io/gc-bucket/iconsets/<name-of-iconset>/`
- Make sure icons look good in demo app (see demo app instructions)
- To copy iconset to GC bucket, run `./app/cmds/upload-iconset.sh <icon-dir>` from host machine


### Uploading a new version of Font Awesome
- npm install the new version to a directory in `io` 
- Add directory to dockerfile, rebuild image
- Start demo app and bash into it - `docker compose up -d` `docker compose exec app bash`
- Run `node ./src/bin/process-fa.js <directory-you-created-in-io>`
- `iconsets` and `dist` directories will be created in your io directory
- To copy iconset to GC bucket, run `./app/cmds/upload-iconset.sh <icon-dir>` from host machine


# Local development

## Demo app instructions
Get the demo app up with:
- `cd app`
- build local image with `./cmds/build-local-dev.sh`
- get google cloud bucket reader key with `./cmds/get-gc-key.sh`
