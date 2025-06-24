import path from 'path';
import spaMiddleware from '@ucd-lib/spa-router-middleware';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (app) => {
  let assetsDir = path.join(__dirname, './client/public');
  const bundle = `
    <script src='/js/bundle.js?v=${(new Date()).toISOString()}'></script>
  `;
  const routes = [];
  const title = 'Cork Icon Demo';

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
        logger: {
          logLevel: process?.env?.LOGGER_LEVEL || 'info'
        }
      });
    },

    template : (req, res, next) => {
      next({
        title,
        bundle,
      });
    }
  });
};
