// Entry point for the browser environment

// cork-app-utils stuff
import IconModel from './lib/IconModel.js';
import { createIconService, IconService } from './lib/IconService.js';
import IconStore from './lib/IconStore.js';
import { iconModel, iconService, iconStore } from './lib/IconModelImp.js';

// elements
import CorkIcon from './elements/cork-icon/cork-icon.js';
import CorkIconSelect from './elements/cork-icon-select/cork-icon-select.js';
import CorkIconButton from './elements/cork-icon-button/cork-icon-button.js';
import CorkPrefixedIconButton from './elements/cork-prefixed-icon-button/cork-prefixed-icon-button.js';

export {
  CorkIcon,
  CorkIconSelect,
  createIconService,
  CorkIconButton,
  CorkPrefixedIconButton,
  IconModel,
  IconService,
  IconStore,
  iconModel,
  iconService,
  iconStore
};
