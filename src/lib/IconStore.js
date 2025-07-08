import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class IconStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      // stores for api responses
      search : new LruStore({name: 'icon.search', maxSize: 20}),
      batch : new LruStore({name: 'icon.batch', maxSize: 10}),
      iconset : new LruStore({name: 'icon.iconset', maxSize: 10}),

      // convenience stores for accessing icons and iconsets
      iconMap : new LruStore({name: 'icon.iconMap', maxSize: 200}),
      iconsetMap : new LruStore({name: 'icon.iconsetMap', maxSize: 200})
    };

    this.events = {};

    this.preloadIcons();
  }

  /**
   * @description Preload icons from the document head if available.
   * @returns
   */
  preloadIcons(){
    if ( typeof window !== 'undefined' ){
      const preloadIcons = window?.document?.head?.querySelector?.('#cork-icon-preload');
      if ( !preloadIcons ) return;
      const data = JSON.parse(preloadIcons.innerText || '{}');
      this.setConvenienceStores(data);
    }
  }

  /**
   * @description Get an icon by its full name.
   * @param {String} name - iconsetNameOrAlias.iconName
   * @param {Object} opts - Options for the icon retrieval.
   * @param {Boolean} opts.returnContent - If true, return the icon content instead of the full icon object.
   * @returns
   */
  getIcon(name, opts={}){
    let icon = this.data.iconMap.get(name);

    // icon not found, could be using iconset alias
    if ( !icon ) {
      const nameParts = name.split('.');
      const iconName = nameParts.pop() || '';
      const iconsetNameOrAlias = nameParts.filter(p => p).join('.');
      const iconset = this.data.iconsetMap.get(iconsetNameOrAlias);
      if ( iconset ){
        icon = this.data.iconMap.get(`${iconset.name}.${iconName}`);
      }
    }

    if ( icon && opts.returnContent ){
      return icon.content;
    }
    return icon;
  }

  /**
   * @description Sets iconMap and iconsetMap stores based on payload from API responses.
   * @param {Object} payload
   */
  setConvenienceStores(payload) {
    // set iconsets
    if ( Array.isArray(payload?.iconsets) ){
      for ( let iconset of payload.iconsets ) {
        this.data.iconsetMap.set(iconset.name, iconset);
        if ( Array.isArray(iconset.aliases) ) {
          for ( let alias of iconset.aliases ) {
            this.data.iconsetMap.set(alias, iconset);
          }
        }
      }
    }
    // set icons
    if ( Array.isArray(payload?.icons) ){
      for ( let icon of payload.icons ) {
        this.data.iconMap.set(`${icon.iconset}.${icon.name}`, icon);
      }
    }

  }

}

export default IconStore;
