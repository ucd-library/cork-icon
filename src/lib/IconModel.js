import { BaseModel } from '@ucd-lib/cork-app-utils';

class IconModel extends BaseModel {

  constructor() {
    super();

    this.debounceTime = 500;
    this.debouncer = null;
    this.batchedIconNames = new Set();

    this.register('IconModel');
  }

  /**
   * @description Search for icons
   * @param {String} q - Search query string (required).
   * @param {Object} opts - Optional parameters.
   * @param {Number} opts.limit - Maximum number of results to return.
   * @param {Array} opts.iconsets - Array of iconset names to limit the search to.
   * @param {Array} opts.excludeIconsets - Array of iconset names to exclude from the search.
   * @returns
   */
  search(q, opts={}) {
    return this.service.search(q, opts);
  }

  /**
   * @description Get icons by their names. Will get from cache if available.
   * By default, this method batches requests to the server
   * @param {(string|string[])} names - A single icon name or an array of icon names e.g. 'iconset.iconName'
   * @param {Object} opts - Optional params
   * @param {boolean} opts.noDebounce - If true, don't debounce the request.
   * @returns
   */
  async batch(names, opts){

    // filter to icons we don't have cached
    const nameSet = new Set();
    if ( !Array.isArray(names) ) names = [names];
    names.forEach(name => {
      if ( !this.store.getIcon(name) ) {
        nameSet.add(name);
      }
    })

    if ( opts?.noDebounce ) {
      if ( nameSet.size ) {
        await this.service.batch([...nameSet]);
      }
      return this.getFromCache(names);
    }

    // add new names to batch
    nameSet.forEach(name => this.batchedIconNames.add(name));
    if ( typeof this.debouncer instanceof Promise ) {
      await this.debouncer;
    } else {
      this.debouncer = await (async () => {
        await new Promise(resolve => setTimeout(resolve, this.debounceTime));
        while ( this.batchedIconNames.size ) {
          const names = [...this.batchedIconNames];
          this.batchedIconNames.clear();
          await this.service.batch(names);
        }
      })();
    }
    return this.getFromCache(names);
  }

  /**
   * @description Get cached icons from model store
   * @param {(string|string[])} names - A single icon name or an array of icon names e.g. 'iconset.iconName'
   * @returns {Array} - Array of icon objects for the requested names.
   */
  getFromCache(names){
    const out = [];
    if ( !names ) return out;
    if ( !Array.isArray(names) ) names = [names];
    names = [...new Set(names)];
    names.forEach(name => {
      out.push(this.store.getIcon(name));
    });
    return out.filter(icon => icon);
  }

}

export default IconModel;
