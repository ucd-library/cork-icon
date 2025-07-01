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

  // Basic info about the loaded iconsets
  router.get('/iconset', (req, res) => {
    res.json({
      iconsets: iconsets.iconsets.map(iconset => iconset.describe())
    });
  });


  /**
   * @description Get icons by name e.g. iconsetOrAlias.iconName
   * Use icons property in query string or body to specify icons.
   * Use a comma-separated list of icon names or an array of icon names.
   */
  router.get('/batch', getIcons);
  router.post('/batch', getIcons);
  function getIcons(req, res){
    try {
      const input = req.query?.icons || req.body?.icons;
      if (!input) {
        return res.status(400).json({ error: 'No icons specified. Use "icons" query parameter or body property.' });
      }
      let icons = (Array.isArray(input) ? input : input.split(',').map(s => s.trim())).filter(icon => icon);
      icons = [...new Set(icons)];

      const output = {
        query: icons,
        iconsets: iconsets.iconsets.filter(iconset => icons.some(icon => iconset.hasIcon(icon))).map(iconset => iconset.describe()),
        icons: icons.map(icon => iconsets.getIcon(icon, {excludeProps: ['searchTerms', 'file']})).filter(icon => icon)
      };

      return res.json(output);

    } catch (e) {
      logger.error('Error processing request:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @description Search for icons
   * @param {String} q - The search query. Can be provided as a query parameter or in the request body.
   * @param {Number} limit - The maximum number of results to return. Defaults to config.search.resultsLimitDefault.
   * @param {Array|String} iconsets - Optional. An array of iconset names or a comma-separated string of iconset names to limit the search to
   */
  router.get('/search', searchIcons);
  router.post('/search', searchIcons);
  function searchIcons(req, res) {
    try {
      const query = req.query?.q || req.body?.q;
      if (!query) {
        return res.status(400).json({ error: 'No search query provided. Use "q" query parameter or body property.' });
      }

      const limit = parseInt(req.query?.limit || req.body?.limit) || config.search.resultsLimitDefault;
      if (isNaN(limit) || limit < 1 || limit > config.search.resultsLimitMax) {
        return res.status(400).json({ error: `Invalid limit. Must be between 1 and ${config.search.resultsLimitMax}.` });
      }

      let iconsetNames = req.query?.iconsets || req.body?.iconsets;
      if (iconsetNames) {
        iconsetNames = Array.isArray(iconsetNames) ? iconsetNames : iconsetNames.split(',').map(s => s.trim());
        iconsetNames = iconsetNames.filter(name => name);
      }

      let excludeIconsets = req.query?.excludeIconsets || req.body?.excludeIconsets;
      if (excludeIconsets) {
        excludeIconsets = Array.isArray(excludeIconsets) ? excludeIconsets : excludeIconsets.split(',').map(s => s.trim());
        excludeIconsets = excludeIconsets.filter(name => name);
      }

      const results = iconsets.search(query, { limit, iconsets: iconsetNames, excludeIconsets });

      return res.json({
        query: { q: query, limit, iconsets: iconsetNames, excludeIconsets },
        iconsets: Array.from(new Set(results.map(icon => icon.iconset))).map(name => iconsets.iconsets.find(iconset => iconset.name === name)?.describe() || { name }),
        icons: results
      });

    } catch (e) {
      logger.error('Error processing search request:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }


  return router;
}
