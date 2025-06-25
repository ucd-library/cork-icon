import express from 'express';
import config from './config.js';
import logger from './logger.js';
import iconsets from './iconsets.js';

/**
 * @description Sets up API routes for retrieving icons
 * @param {Object} opts
 * @param {Array|String} opts.iconsets - An array of iconset names or a single iconset name to register. If not provided, defaults to an empty array.
 * @param {String} opts.iconsets.name - The name of the iconset.
 * @param {String} opts.iconsets.aliases - An array of aliases for the iconset. Optional.
 * @returns
 */
export default function iconApiMiddleware(opts = {}) {

  // register iconsets and load icons
  if ( opts.iconsets ){
    for ( let iconset of Array.isArray(opts.iconsets) ? opts.iconsets : [opts.iconsets] ) {
      if ( typeof iconset === 'string' ) {
        iconsets.register(iconset);
      } else if ( iconset?.name ) {
        iconsets.register(iconset.name, {
          aliases: iconset.aliases || []
        });
      } else {
        logger.error('Iconset arg must be a string or an object with a name property');
      }
    }
  } else {
    logger.info('No Iconsets provided. Skipping registration.');
  }

  const router = express.Router();
  router.get('/', (req, res) => {
    res.json({
      iconsets: iconsets.iconsets.map(iconset => ({
        name: iconset.name,
        aliases: iconset.aliases || [],
        iconCt: iconset.icons.length
      }))
    });
  });
  return router;
}
