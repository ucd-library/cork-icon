import { BaseService } from '@ucd-lib/cork-app-utils';
import payloadUtils from './payload.js';

/**
 * @description Class factory to create an IconService.
 * In case user wants to use their own extended cork-app-utils BaseService
 * @param {*} Base
 * @returns {IconService}
 */
function createIconService(Base = Object) {

  return class IconService extends Base {

    constructor(...args) {
      super(...args);
      this.apiDomain = '';
      this.apiPath = '/api/icon';
    }

    /**
     * @description Override this method to modify the fetch options
     * e.g. if you need to add headers or change the method.
     * @param {Object} opts - Default fetch options defined by the service method.
     * @param {String} serviceMethod - The service method being called (e.g. 'search', 'batch').
     * @returns
     */
    fetchOptions(opts, serviceMethod) {
      return opts;
    }

    async search(q, opts={}) {
      let ido = {q, ...opts};
      let id = payloadUtils.getKey(ido);
      const requestStore = this.store.data.search;

      await this.checkRequesting(
        id, requestStore,
        () => this.request({
          url : `${this.apiDomain}${this.apiPath}/search`,
          fetchOptions: this.fetchOptions({
            method : 'POST',
            body: ido
          }, 'search'),
          json: true,
          checkCached: () => requestStore.get(id),
          onUpdate: resp => {
            this.store.set({id, ...resp}, requestStore);
            this.store.setConvenienceStores(resp?.payload);
          }
        })
      );
      return requestStore.get(id);
    }

    async batch(icons){
      let ido = {icons};
      let id = payloadUtils.getKey(ido);

      const requestStore = this.store.data.batch;

      await this.checkRequesting(
        id, requestStore,
        () => this.request({
          url : `${this.apiDomain}${this.apiPath}/batch`,
          fetchOptions: this.fetchOptions({
            method : 'POST',
            body: ido
          }, 'batch'),
          json: true,
          checkCached: () => requestStore.get(id),
          onUpdate: resp => {
            this.store.set({...resp, id}, requestStore);
            this.store.setConvenienceStores(resp?.payload );
          }
        })
      );

      return requestStore.get(id);
    }
  }
}

const IconService = createIconService(BaseService);

export {
  createIconService,
  IconService
};
