import {AppStateModel} from '@ucd-lib/cork-app-state';
import AppStateStore from '../stores/AppStateStore.js';

class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();
    this.store = AppStateStore;

    this.init(window.APP_CONFIG.routes);
  }

  set(update) {
    if( update.location ) {
      let page = update.location.path?.[0] ? update.location.path[0] : 'cork-icon';
      update.page = page;
    }

    return super.set(update);
  }

  refresh(){
    const state = this.store.data;
    this.store.emit(this.store.events.APP_STATE_UPDATE, state);
  }

}

const model = new AppStateModelImpl();
export default model;
