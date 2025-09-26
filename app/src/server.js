import express from 'express';
import setUpStaticRoutes from './static.js';
import { iconApiMiddleware } from '@ucd-lib/cork-icon';

const app = express();
app.use(express.json());

const api = express.Router();

// set up the icon API middleware
// will be mounted at /api/icon
const iconsets = [
  { name: 'fontawesome-7.0-brands', aliases: ['fab']},
  { name: 'fontawesome-7.0-solid', aliases: ['fas'], preload: ['leaf', 'seedling', 'tree']},
  { name: 'fontawesome-7.0-regular', aliases: ['far']},
  { name: 'ucdlib-core', preload: true}
];
api.use('/icon', iconApiMiddleware({iconsets}));

// routes
app.use('/api', api);
setUpStaticRoutes(app);

app.listen(3000, () => {
  console.log('Demo application is running on port 3000');
});
