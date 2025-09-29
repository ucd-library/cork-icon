import path from 'path';
import spaMiddleware from '@ucd-lib/spa-router-middleware';
import { fileURLToPath } from 'url';
import { iconsets, preload } from '@ucd-lib/cork-icon';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (app) => {
  let assetsDir = path.join(__dirname, './client/public');
  const bundle = `
    <script src='/js/bundle.js?v=${(new Date()).toISOString()}'></script>
  `;
  const routes = ['select', 'other-elements'];
  const title = 'Cork Icon Demo';

  // preload icons using middleware. preloaded args are defined when setting up the middleware
  const preloadedIcons = preload();

  // preload icons without using middleware
  // const preloadedIcons = preload([
  //   { name: 'fontawesome-6.7-solid', aliases: ['fas'], preload: ['leaf', 'seedling', 'tree']},
  //   { name: 'ucdlib-core'}
  // ]);

  // call iconscript generator directly
  // no reason to do this other than for debugging
  //const preloadedIcons = iconsets.preloadIconScript(['fab.google', 'fas.seedling'], ['foo']);

  spaMiddleware({
    app,
    htmlFile : path.join(assetsDir, 'index.html'),
    isRoot : true,
    appRoutes : routes,
    static : {
      dir : assetsDir
    },
    enable404 : false,

    getConfig : async (req, res, next) => {
      next({
        routes : routes,
        title: title,
        corkIconConfig: {apiPath: '/api/icon'},
        logger: {
          logLevel: process?.env?.LOGGER_LEVEL || 'info'
        }
      });
    },

    template : (req, res, next) => {
      next({
        title,
        bundle,
        preloadedIcons
      });
    }
  });
};
