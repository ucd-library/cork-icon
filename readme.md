# cork-icon (WIP)

This package allows you to use icons in any cork-app-utils application with the following features:
- Dynamically load only the icons you need in your SPA
- Seamlessly integrate custom icons with Font Awesome
- Use iconsets developed for other UC Davis Library applications
- Allow users to search for and select icons with a custom element


# Local development

## Demo app instructions
Get the demo app up with:
- `cd app`
- build local image with `./cmds/build-local-dev.sh`
- get google cloud bucket reader key with `./cmds/get-gc-key.sh`


## Creating a new custom iconset
todo

## Adding an icon to an existing custom iconset
todo

## Uploading a new version of Font Awesome
- npm install the new version to a directory in `io` 
- Add directory to dockerfile, rebuild image
- Start demo app and bash into it
- Run `node ./bin/process-fa.js <directory-you-created-in-io>`
- `iconsets` and `dist` directories will be created in your io directory
- Copy the contents of these directories into the appropriate spot in the Google Cloud bucket
