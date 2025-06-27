import './css/index.js';

import "@ucd-lib/cork-app-utils";

import { Registry } from '@ucd-lib/cork-app-utils';
import './lib/models/AppStateModel.js';
import './lib/models/IconModel.js';

Registry.ready();

import './elements/app-main.js';
