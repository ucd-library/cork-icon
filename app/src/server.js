import express from 'express';
import setUpStaticRoutes from './static.js';

const app = express();
app.use(express.json());

setUpStaticRoutes(app);

app.listen(3000, () => {
  console.log('Demo application is running on port 3000');
});
