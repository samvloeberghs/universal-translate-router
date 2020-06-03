// Zone.js MUST be imported before setting the global Window variable!
// The rest of tis file is modeled after the angular/universal-starter repo
import { enableProdMode } from '@angular/core';
// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import * as compression from 'compression';
// Import Domino (server-side DOM based on dom.js)
import * as domino from 'domino';
import * as express from 'express';
// Setting this global Window variable this way was inspired by https://github.com/Angular-RU/angular-universal-starter
import { join } from 'path';
import 'reflect-metadata';
import 'zone.js/dist/zone-node';

const fs = require('fs');

const PORT = process.env.PORT || 4200;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Import the index.html file as a string
const template = fs
  .readFileSync(join(DIST_FOLDER, 'browser', 'index.html'))
  .toString();
// Create a Window object from the template
// Save as 'any' so we can overwrite language
const win = domino.createWindow(template) as any;
// Language needs to be set because @ngx-translate/core is stupid and assumes it's filled
// while Domino just uses the official Window spec from W3C.
win['navigator']['language'] = 'en';
// Set the window object as global var
global['window'] = win;
global['navigator'] = win.navigator;
global['document'] = win.document;

// import 'reflect-metadata';
// import 'zone.js/dist/zone-node';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();
app.use(compression());

/* tslint:disable */

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP
} = require('./dist/server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine(
  'html',
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [provideModuleMap(LAZY_MODULE_MAP)]
  })
);

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });
// Server static files from /browser
app.get(
  '*.*',
  express.static(join(DIST_FOLDER, 'browser'), {
    maxAge: '1y'
  })
);

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req, res });
});

// Start up the Node server by listening on the right port
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}\n\n`);
});
