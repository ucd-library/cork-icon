# cork-icon

This package allows you to use icons in any [cork-app-utils](https://github.com/ucd-library/cork-app-utils) application with the following features:
- Dynamically load only the icons you need in your SPA, including lazy loading
- Seamlessly integrate custom icons with Font Awesome
- Easily share custom icons between projects
- Allow users to search for and select icons with a custom element
  
# Usage

## Install and Load

```bash
npm i @ucd-lib/cork-icon
node ./node_modules/\@ucd-lib/cork-icon/bin/download.js 
```

## Set Up Middleware

Set up API endpoints by using the Express middlware:

```js
import express from 'express';
import { iconApiMiddleware } from '@ucd-lib/cork-icon';

const app = express();
app.use(express.json());

// select some iconsets available in the Google Cloud bucket
// https://console.cloud.google.com/storage/browser/cork-icon;tab=objects?project=digital-ucdavis-edu
const iconsets = [
  { name: 'fontawesome-6.7-brands', aliases: ['fab']},
  { name: 'fontawesome-6.7-solid', aliases: ['fas']},
  { name: 'fontawesome-6.7-regular', aliases: ['far']},
  'myCustomSet' // can just be string if you don't want to use aliases
];
app.use('/icon', iconApiMiddleware({iconsets})); // endpoints will be available at /icon
```

## Set Up Model, Service, Store

### Basic
Simply importing the package will set everything up for you on the browser side:
```js
import '@ucd-lib/cork-icon';
```

You might need to override some default settings, in which case you can set `APP_CONFIG.corkIconConfig` or `corkIconConfig` on the window:

| Property | Description |
| -------- | ----------- |
| `debounceTime` | Length of time model waits to batch calls |
| `apiDomain` | Domain where api endpoint is located |
| `apiPath`  | Path of middleware api |

### Advanced

If the basic set up doesn't work for you, you can always extend the base classes:

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

If you need to update the fetch options for the service methods (like sending a header), you can override the `fetchOptions` method:
```js
  // service method will be 'batch' or 'search'
  fetchOptions(opts, serviceMethod) {
    opts.headers = addAuthHeader()
    return opts;
  }
```

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

## Display Icons
Now, you can use the `cork-icon` element to show icons

```html
<!-- Specify icon using the icon attribute. fmt: iconsetNameOrAlias.iconName-->
<cork-icon icon='fas.dog'></cork-icon>

<!-- By default, if the icon property is updated, the icon will be fetched from the server, 
 but you can postpone this until the icon enters the viewport by updating the fetch-strategy property-->
<cork-icon icon='fas.cat' fetch-stategy='lazy'></cork-icon>

<!-- Icons will inherit the color. Quickly assign colors using the brand classes. --> 
 <cork-icon icon='fas.frog' class='quad'></cork-icon> <!-- A green frog. --> 
```

Complete list of properties:
```js
/**
 * @property {String} icon - The name of the icon to display, e.g. 'iconsetNameOrAlias.iconName'.
 * @property {String} size - The keyword size of the icon.
 * Uses predefined UCD theme spacer sizes: tiny, small, medium, large, huge.
 * Size of icon can also be set using --cork-icon-size CSS variable.
 * @property {Number} transformDegrees - Degrees to rotate the icon.
 * Rotation can also be set using --cork-icon-rotate CSS variable.
 * @property {Boolean} invisibleIfEmpty - If true and the icon data has not been loaded, no space will be taken up by the icon.
 * @property {Boolean} autoHeight - If true, the height of the icon will be based on the svg viewBox. Otherwise, the icon will be square.
 * @property {String} fetchStrategy - Strategy for fetching icon data. Cam be 'property-change' (default), 'manual', or 'lazy'.
 * If 'property-change', the icon data will be fetched when the `icon` property changes.
 * If 'manual', the icon data must be fetched manually using the `getIconData()` method.
 * If 'lazy', the icon data will be fetched when the icon is in view using IntersectionObserver.
 * @property {Boolean} disableFadeIn - If true, the icon will not fade in when it is first loaded.
 * @property {Object} data - The icon data object from the API.
 *
 */
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
- Follow instructions in local development section to get app container up
- Process iconset with `app/cmds/process-iconset.sh <name-of-iconset>`. This adds/removes icons from metadata file, and zips the iconset
- Review the `metadata.json` file. Specifically, update the `label` and `searchTerms` properties for each icon to improve the icon search experience.
- If any changes are made to `metadata.json`, run the command again to ensure these are reflected in the zipped version
- Make sure icons look good in demo app (see demo app instructions)
- To copy iconset to GC bucket, run `./app/cmds/upload-iconset.sh <icon-dir>` from host machine


### Uploading a new version of Font Awesome
- npm install the new version to a directory in `io` 
- Add directory to dockerfile, rebuild image
- Follow instructions in local development section to get app container up
- Run `app/cmds/process-fa.sh <name-of-dir-in-io>`
- `iconsets` and `dist` directories will be created in your io directory
- To copy iconset to GC bucket, run `./app/cmds/upload-iconset.sh <icon-dir>` from host machine


# Local development

If you need to work on the src code or edit an iconset, you will need to set up the demo app:
- `cd app`
- build local image with `./cmds/build-local-dev.sh`
- get google cloud bucket reader key with `./cmds/get-gc-key.sh`
- start app container with `cd cork-icon-local-dev && docker compose up -d`

To start app server with: 
- iconsets downloaded to your local host (`download-gc-bucket.sh`) run `app/cmds/start-server.sh dev`
- iconsets downloaded at image build run `app/cmds/start-server.sh`

If you need to develop the browser-side src code, run `app/cmds/watch-client.sh` to get the watch process going
