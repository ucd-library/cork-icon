import {AppStateStore} from '@ucd-lib/cork-app-state';

class AppStateStoreImpl extends AppStateStore {
  constructor(){
    super();
  }
}

const store = new AppStateStoreImpl();
export default store;
