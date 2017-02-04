'use strict';

/**
 * Module dependencies.
 * @private
 */
const Redis = require('ioredis');

const client = new Redis();

module.exports = {
  call: async (command, ...args) => {
    return await client[command](...args).catch(error => {
      // @todo: Log error

      // @todo: flushdb when reaches maxmemory

      return null;
    });
  }, 

  quit: async () => {
    await client.quit();

    return;
  }, 

  client
};