'use strict';

/**
 * Module dependencies.
 * @private
 */
const path       = require('path');
const express    = require('express');
const helmet     = require('helmet');
const bodyParser = require('body-parser');

const routes = require('./routes');
const config = require('../config');

const app = express();

app.set('port', config.www.port);
app.disable('x-powered-by');

app.use(helmet({
  frameguard: {
    action: 'allow-from', 
    domain: 'https://vk.com/'
  }, 
  hidePoweredBy: false, 
  hsts:          false, 
  noSniff:       false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public/static')));
app.use(routes);

module.exports = app;