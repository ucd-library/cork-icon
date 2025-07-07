import './css/index.js';

import "@ucd-lib/cork-app-utils";

import { Registry } from '@ucd-lib/cork-app-utils';
import './lib/models/AppStateModel.js';

// Use extended models
// import './lib/models/IconModel.js';

// User default models
import '@ucd-lib/cork-icon';

Registry.ready();

import './elements/app-main.js';
