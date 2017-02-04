'use strict';

/**
 * Module dependencies.
 * @private
 */
const mongoose = require('mongoose');
const config   = require('../config');

// Скажем Mongoose использовать нативные Promises
mongoose.Promise = global.Promise;

const connection = mongoose.createConnection(config.mongoose.uri, config.mongoose.options);

module.exports = connection;