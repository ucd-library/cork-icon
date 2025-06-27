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
  async batch(names, opts = {}) {
  if (!Array.isArray(names)) names = [names];

  const missing = names.filter(name => !this.store.getIcon(name));
  if (opts.noDebounce) {
    if (missing.length) {
      await this.service.batch(missing);
    }
    return this.getFromCache(names);
  }

  // Add names to batch
  missing.forEach(name => this.batchedIconNames.add(name));

  // Setup a shared debounce promise
  if (!this.debouncer) {
    this.debouncer = new Promise(resolve => {
      setTimeout(async () => {
        const toFetch = [...this.batchedIconNames];
        this.batchedIconNames.clear();
        await this.service.batch(toFetch);
        resolve(); // resolve all queued batch() calls
        this.debouncer = null;
      }, this.debounceTime);
    });
  }

  await this.debouncer;
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

  /**
   * @description Find an icon by its name in an array of icons.
   * @param {String} name - The name of the icon to find, e.g. 'iconset.iconName'. Works with aliases.
   * @param {Array} icons - An array of icon objects
   * @returns {Object|null} - The icon object if found, otherwise null.
   */
  findIconInArray(name, icons=[]){
    if ( !name ) return null;
    if ( icons.find(icon => icon.name === name) ) {
      return icons.find(icon => icon.name === name);
    }

    // check for aliases
    const nameParts = name.split('.');
    const iconName = nameParts.pop() || '';
    const iconsetNameOrAlias = nameParts.filter(p => p).join('.');
    if ( !iconsetNameOrAlias ) return null;
    const iconset = this.store.data.iconsetMap.get(iconsetNameOrAlias);
    if ( iconset && icons.find(icon => icon.iconset === iconset.name && icon.name === iconName) ) {
      return icons.find(icon => icon.iconset === iconset.name && icon.name === iconName);
    }

    return null;
  }

}

export default IconModel;
