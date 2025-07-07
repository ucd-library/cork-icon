// Entry point for the browser environment

// cork-app-utils stuff
import IconModel from './lib/IconModel.js';
import { createIconService, IconService } from './lib/IconService.js';
import IconStore from './lib/IconStore.js';
import { iconModel, iconService, iconStore } from './lib/IconModelImp.js';

// elements
import CorkIcon from './elements/cork-icon/cork-icon.js';
import CorkIconSelect from './elements/cork-icon-select/cork-icon-select.js';

export {
  CorkIcon,
  CorkIconSelect,
  createIconService,
  IconModel,
  IconService,
  IconStore,
  iconModel,
  iconService,
  iconStore
};
