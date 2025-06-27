import { IconService as BaseService } from '@ucd-lib/cork-icon';
import IconStore from '../stores/IconStore.js';

class IconService extends BaseService {

  constructor() {
    super();
    this.store = IconStore;

    this.apiDomain = '';
    this.apiPath = '/api/icon';
  }

}

const service = new IconService();
export default service;
