import iconsets from './iconsets.js';
import logger from './logger.js';

/**
 * @description Preload icons from specified iconsets and return a script tag to include in HTML
 * For use when you want to preload icons without using the icon API middleware.
 * Note that this will clear out all registered iconsets to free memory after preloading.
 * @param {Array} iconsetOpts - An array of iconset options to register and preload icons from.
 * @param {String} iconsetOpts.name - The name of the iconset.
 * @param {Array} iconsetOpts.aliases - An array of aliases for the iconset. Optional.
 * @param {Array} iconsetOpts.preload - Optional. A subset of icon names to preload. If not provided, all icons in the iconset will be preloaded.
 * @returns {String} A script tag containing the preloaded icons.
 */
export default (iconsetOpts=[]) => {

  for ( let iconset of iconsetOpts ) {
    let iconsetName = typeof iconset === 'string' ? iconset : iconset?.name;
    let aliases = Array.isArray(iconset?.aliases) ? iconset.aliases : [];
    if ( iconsetName ){
      iconsets.register(iconsetName, {aliases, preload: Array.isArray(iconset?.preload) ? iconset.preload : true, lruSize: -1});
    } else {
      logger.error('Iconset arg must be a string or an object with a name property');
      continue;
    }
  }

  const out = iconsets.preloadIconScript();

  // clear out loaded iconsets to free memory
  iconsets.iconsets = [];

  return out;
}
