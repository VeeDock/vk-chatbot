'use strict';

/**
 * Module dependencies.
 * @private
 */
const redis  = require('../../../../database/redis');
const limits = require('../../../../config/limits');

// used in /tts only
async function incrby (key, num) {
  let rkey = 'limit:' + key;

  return await redis.call('incrby', rkey, num);
}

async function incr ({ key, id, botId }) {
  let limit = limits[key];

  if (!limit) 
    return {
      status: 'not_stated'
    };

  let rkey = 'limit:' + key;

  if (limit.type === 'local') {
    rkey += ':' + id;

    if (botId) 
      rkey += ':' + botId;
  }

  let value = await redis.call('incr', rkey);

  if (value === (limit.count + 1)) {
    let ttl = await redis.call('ttl', rkey);

    return {
      status: 'reached', 
      ttl
    };
  }

  if (value > (limit.count + 1)) 
    return {
      status: 'exceed'
    };

  // Лимит ещё не был установлен, либо уже истёк.
  if (value === 1) 
    await redis.call('expire', rkey, limit.time);

  return {
    status: 'not_reached'
  };
}

/**
 * @param {Object}
 *   @property {String} key    Лимит
 *   @property {Number} id     ID пользователя
 *   @property {Number} botId  ID Бота
 * @return {Object} { status, ttl }
 * @public
 */
async function get ({ key, id, botId }) {
  let limit = limits[key];

  if (!limit) 
    return {
      status: 'not_stated'
    };

  let rkey = 'limit:' + key;

  if (limit.type === 'local') {
    rkey += ':' + id;

    if (botId) 
      rkey += ':' + botId;
  }

  let value = await redis.call('get', rkey).then(v => parseInt(v));

  if (value >= (limit.count + 1)) {
    return {
      status: 'reached'
    };
  }

  return {
    status: 'not_reached'
  };
}

module.exports = {
  get, incr, incrby
};