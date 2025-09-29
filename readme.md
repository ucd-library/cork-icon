# cork-icon

This package allows you to use icons in any [cork-app-utils](https://github.com/ucd-library/cork-app-utils) application with the following features:
- Dynamically load only the icons you need in your SPA, including lazy loading
- Seamlessly integrate custom icons with Font Awesome
- Easily share custom icons between projects
- Allow users to search for and select icons with a custom element

## Table of Contents

- [Usage](#usage)
  - [Install and Load](#install-and-load)
  - [Set Up Middleware](#set-up-middleware)
  - [Set Up Model, Service, Store](#set-up-model-service-store)
    - [Basic](#basic)
    - [Advanced](#advanced)
  - [Display Icons](#display-icons)
  - [Other Custom Elements](#other-custom-elements)
    - [cork-icon-button](#cork-icon-button)
    - [cork-prefixed-icon-button](#cork-prefixed-icon-button)
  - [Preload Icons](#preload-icons)
    - [In Conjunction with the API](#in-conjunction-with-the-api)
    - [Without the API](#without-the-api)
- [Updating Icons](#updating-icons)
  - [Adding an icon to an existing custom iconset](#adding-an-icon-to-an-existing-custom-iconset)
  - [Creating a new custom iconset](#creating-a-new-custom-iconset)
  - [Updating icons](#updating-icons-1)
  - [Uploading a new version of Font Awesome](#uploading-a-new-version-of-font-awesome)
  
# Usage

## Install and Load

```bash
npm i @ucd-lib/cork-icon
```

This will automatically download all iconsets in the `cork-icon` Google Cloud bucket in `digital-ucdavis-edu` project.

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

**If you want to bypass the icon api all together and preload just the icons you need in the spa-middleware template, see the [Preload Icons section](#preload-icons) below.**

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

If the basic set up doesn't work for you, you can always extend the base classes. You will want to disable the default instatiation with `corkIconConfig.noInstantiation`.

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
 */
```

## Other Custom Elements
This package provides some pre-styled components that use icons at their core:

### cork-icon-button
```js
/**
 * @description An icon button component. Use --cork-icon-button-size variable to set the size of the element.
 * @property {String} color - The color theme of the button. Can be 'dark', 'medium', 'light', or 'white'.
 * @property {Boolean} basic - If true, the button will have no background or border. Overrides color property.
 * @property {String} icon - The icon to display in the button. Must be a valid icon slug.
 * @property {String} iconFetchStrategy - The fetch strategy to use for the icon. Passed to the cork-icon element.
 * @property {String} href - Optional. If set, the button will be a link to the provided href. Otherwise, a button element will be rendered that will emit a click event.
 * @property {Boolean} disabled - Optional. If true, the button will be disabled.
 * @property {String} linkAriaLabel - Optional. If href is set, this will be used as the aria-label for the link.
 */
```

### cork-prefixed-icon-button
```js
/**
 * @description Component for displaying a button with a prefixed icon
 * @prop {String} text - the text to display in the button. Can also be set via slot.
 * @prop {String} color - the color theme of the button. Can be 'dark', 'medium', or 'light'.
 * @prop {String} icon - the icon to display in the button. Passed to cork-icon as the 'icon' prop.
 * @prop {String} iconFetchStrategy - optional. Passed to cork-icon as the 'fetch-strategy' prop.
 * @prop {String} href - optional. If set, the button will be a link to the provided href. Otherwise, a button element will be rendered.
 * @prop {Boolean} disabled - optional. If true, the button will be disabled.
 * @prop {String} buttonType - optional. The type attribute for the button element. Defaults to 'button'.
 */
```

## Preload Icons

### In Conjunction with the API
If you simply can't abide the half-second delay when loading icons, you can preload them in your [spa-router-middleware](https://github.com/UCDavisLibrary/spa-router-middleware) template.

First, declare the icons you want to preload when setting up the middleware:
```js
const iconsets = [
  // passing an array will only load the specified icons
  { name: 'fontawesome-6.7-solid', aliases: ['fas'], preload: ['leaf', 'seedling', 'tree']},

  // passing 'true' will load the whole iconset. shouldn't be used on large iconsets.
  { name: 'mySmallCustomSet', preload: true}
];
```

Next, pass to template in SPA middleware:
```js
import spaMiddleware from '@ucd-lib/spa-router-middleware';
import { preload } from '@ucd-lib/cork-icon';

// this will make a json script tag with your designated icons
const preloadedIcons = preload();

spaMiddleware({
  app,
  template : (req, res, next) => {
    next({
      preloadedIcons
    });
  }
});
```

Finally, put it in the head of template:
```hbs
<!doctype html>
<html>
  <head>
    {{preloadedIcons}}
  </head>
</html>
```

### Without the API
If you don't need to dynamically load icons with the API, you can skip the api middleware step, and load the icons directly in your SPA middleware template:

```js
import spaMiddleware from '@ucd-lib/spa-router-middleware';
import { preload } from '@ucd-lib/cork-icon';

const preloadedIcons = preload([
  // load just specified icons
  { name: 'fontawesome-6.7-solid', aliases: ['fas'], preload: ['leaf', 'seedling', 'tree']}, 

  // load a whole (hopefully small) set
  { name: 'ucdlib-core'} 
]);

spaMiddleware({
  app,
  template : (req, res, next) => {
    next({
      preloadedIcons
    });
  }
});
```

# Updating Icons

All iconsets are stored in a [Google Cloud Storage bucket](https://console.cloud.google.com/storage/browser/cork-icon;tab=objects?project=digital-ucdavis-edu). This package downloads the zipped version of the iconsets from the `dist` directory.

Before doing work on the src code of this package or updating the iconsets, you will need to get the dev docker container up and running:

- `cd app`
- build local image with `./cmds/build-local-dev.sh`
- get google cloud bucket reader key with `./cmds/get-gc-key.sh`
  - if you need to update the iconsets, you will need access to the `cork-icon-bucket-writer` secret and write abilities to the bucket through your GC account.
- start app container with `cd cork-icon-local-dev && docker compose up -d`
- build client with `app/cmds/build-client.sh`

To start app server with: 
- iconsets downloaded to your local host (`download-gc-bucket.sh`) run `app/cmds/start-server.sh dev`
- iconsets downloaded at image build run `app/cmds/start-server.sh`

If you need to develop the browser-side src code, run `app/cmds/watch-client.sh` to get the watch process going

## Adding an icon to an existing custom iconset
- Add the icon file to `gs://cork-icon/iconsets/<name-of-iconset>/icons` in digital-ucdavis-edu project
- Download latest version of iconset to your host machine with `./app/cmds/download-gc-bucket <name-of-iconset>`.
- Follow the instructions in **Updating Icons** section below

## Creating a new custom iconset
- Create the directory for your new iconset with `./app/cmds/create-iconset.sh <name-of-iconset>`, which will be placed in `./io/gc-bucket/iconsets/<name-of-iconset>`
- Place icons into the `icons` directory of your iconset
- Follow the instructions in **Updating Icons** section below

## Updating icons
- Make sure the dev container is up
- Process iconset with `app/cmds/process-iconset.sh <name-of-iconset>`. This adds/removes icons from metadata file, and zips the iconset
- Review the `metadata.json` file. Specifically, update the `label` and `searchTerms` properties for each icon to improve the icon search experience.
- If any changes are made to `metadata.json`, run the command again to ensure these are reflected in the zipped version
- Make sure icons look good in demo app (see demo app instructions)
- To copy iconset to GC bucket, from your iconset directory. run `../../../../app/cmds/upload-iconset.sh .`

## Uploading a new version of Font Awesome
- npm install the new version to a directory in `io` 
- Add directory to dockerfile, rebuild image
- Follow instructions in local development section to get app container up
- Run `app/cmds/process-fa.sh <name-of-dir-in-io>`
- `iconsets` and `dist` directories will be created in your io directory
- To copy iconset to GC bucket, from the directory you created in `io` run `../../app/cmds/upload-iconset.sh .`
