# cork-icon (WIP)

This package allows you to use icons in any cork-app-utils application with the following features:
- Dynamically load only the icons you need in your SPA
- Seamlessly integrate custom icons with Font Awesome
- Easily share icons between projects
- Allow users to search for and select icons with a custom element
  
# Usage

## Install and Load
...

## Set Up Middleware

Set up API endpoints by using the Express middlware:

```js
import express from 'express';
import { iconApiMiddleware } from '@ucd-lib/cork-icon';

const app = express();
app.use(express.json());

// select some iconsets available in the Google Cloud bucket
const iconsets = [
  { name: 'fontawesome-6.7-brands', aliases: ['fab']},
  { name: 'fontawesome-6.7-solid', aliases: ['fas']},
  { name: 'fontawesome-6.7-regular', aliases: ['far']},
  'myCustomSet' // can just be string if you don't want to use aliases
];
app.use('/icon', iconApiMiddleware({iconsets})); // endpoints will be available at /icon

```

## Set Up Model, Service, Store

Next, we need to set up our cork-app-utils model/service/store for interacting with the API.

Extend the BaseModel to assign your store and service:
```js
import { IconModel as BaseModel } from '@ucd-lib/cork-icon';
import IconService from '../services/IconService.js';
import IconStore from '../stores/IconStore.js';

class IconModel extends BaseModel {

  constructor() {
    super();

    this.store = IconStore;
    this.service = IconService;
  }

}

const model = new IconModel();
export default model;
```

Set `apiDomain` and `apiPath` to match what you set in your Express middleware.
```js
import { IconService as BaseService } from '@ucd-lib/cork-icon';
import IconStore from '../stores/IconStore.js';

class IconService extends BaseService {

  constructor() {
    super();
    this.store = IconStore;

    this.apiDomain = '';
    this.apiPath = '/icon';
  }

}

const service = new IconService();
export default service;
```

If you need to update the fetch options for the service methods (like sending a header), you can override the `fetchOptions` method.

If you need to use your own extended cork-app-utils base service, you can do:
```js
import { createIconService } from '@ucd-lib/cork-icon';
import customBaseService from './baseService.js';
const IconBase = createIconService(customBaseService);
class IconService exends IconBase{...}
```

Finally, you just need to instantiate the store
```js
import { IconStore } from '@ucd-lib/cork-icon';
const store = new IconStore();
export default store;
```

# Updating Icons

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
