'use strict';

/**
 * Module dependencies.
 * @private
 */
const http  = require('http');
const debug = require('debug')('server');
const app   = require('./server');

const server = http.createServer(app);

server.listen(app.get('port'));
server.on('error', onError);

/**
 * Event listener for HTTP server "error" event.
 * @param {Object} error
 * @private
 */
function onError (error) {
  if (error.syscall !== 'listen') 
    throw error;

  let port = app.get('port');

  switch (error.code) {
    case 'EACCES':
      console.error('Port ' + port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('Port ' + port + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}