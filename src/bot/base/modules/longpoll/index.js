'use strict';

/**
 * Module dependencies.
 * @private
 */
const async            = require('async');
const prequest         = require('request-promise');
const updatesProcessor = require('./updates-processor');

const eventEmitter = new (require('events').EventEmitter)();

/**
 * Отправляет запрос к LongPoll серверу.
 * @param {Object}
 *   @property {Number}    id  ID бота
 *   @property {Reference} api Ссылка на экземпляр VKApi
 * @return {Function}
 * @private
 */
function sendRequest ({ id, api }) {
  let link = '';

  return next => {
    if (link === '') 
      return api.call('messages.getLongPollServer')
        .then(response => {
          link = `https://${response.server}?act=a_check&wait=25&mode=2&key=${response.key}&ts=${response.ts}`;

          return next();
        })
        .catch(error => {
          // @todo: Log error

          return next();
        });

    return prequest(link, { json: true })
      .then(response => {
        if (response.failed && response.failed !== 1) {
          link = '';

          return next();
        }

        link = link.replace(/ts=.*/, 'ts=' + response.ts);

        if (!response.updates || response.updates.length < 1) 
          return next();

        updatesProcessor({
          id, 
          data: response.updates
        }, eventEmitter);

        return next();
      })
      .catch(error => {
        // @todo: Log error

        return next();
      });
  }
}

/**
 * Запускает LongPoll модуль.
 * @param  {Object} apis Экземпляры VKApi
 * @return {Reference}   Ссылка на экземпляр EventEmitter
 * @public
 */
function longpoll (apis) {
  for (let id of Object.keys(apis)) 
    async.forever(sendRequest({ id: parseInt(id), api: apis[id] }));

  return eventEmitter;
}

module.exports = {
  start: longpoll
};