import IconModel from './IconModel.js';
import { IconService } from './IconService.js';
import IconStore from './IconStore.js';

let config = {};
if (typeof window !== 'undefined') {
  if ( window.corkIconConfig ){
    config = window.corkIconConfig;
  } else if ( window.APP_CONFIG?.corkIconConfig ){
    config = window.APP_CONFIG.corkIconConfig;
  }
}

let iconModel, iconStore, iconService;

if ( !config.noInstantiation ){
  iconModel = new IconModel(config);
  iconStore = new IconStore(iconModel);
  iconService = new IconService();
  iconService.store = iconStore;
  if ( config.apiDomain ){
    iconService.apiDomain = config.apiDomain;
  }
  if ( config.apiPath ){
    iconService.apiPath = config.apiPath;
  }
  iconModel.service = iconService;
  iconModel.store = iconStore;
}

export {
  iconModel,
  iconStore,
  iconService
}
