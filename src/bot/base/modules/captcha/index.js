'use strict';

/**
 * Module dependencies.
 * @private
 */
const redis = require('../../../../database/redis');

/**
 * Возвращает активные капчи.
 * @return {Object}
 * @public
 */
async function getActiveCaptchas () {
  return await redis.call('hgetall', 'captcha:active');
}

async function getKey ({ bot_id, sid }) {
  return await redis.call('get', `captcha:key:${sid}:${bot_id}`);
}

/**
 * Устанавливает активную капчу.
 * @param {Object}
 *   @property {Number} bot_id  ID бота
 *   @property {String} sid     Captcha SID
 * @return {String}
 * @public
 */
async function setActive ({ bot_id, sid }) {
  //await redis.call('publish', 'captcha', `${bot_id}:${sid}`);

  return await redis.call('hset', 'captcha:active', bot_id, sid).then(() => 'OK');
}

async function unsetActive ({ bot_id, sid }) {
  //await redis.call('publish', 'captcha_recognized', `${bot_id}:${sid}`);

  return await redis.call('hdel', 'captcha:active', bot_id).then(() => 'OK');
}


module.exports = {
  getActiveCaptchas, 
  getKey, 
  setActive, 
  unsetActive
};