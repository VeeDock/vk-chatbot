'use strict';

/**
 * Module dependencies.
 * @private
 */
const User = require('../../database/models/user');

/**
 * Боту прислали подарок.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function gift ({ id, data, app, user }) {
  let isOk = await User.upd(data.sender_id, { $inc: { points_count: 50 } });

  if (!isOk) 
    return 'Спасибо за подарок, дружище! :-) :-*';
  else 
    return 'Спасибо за подарок, дружище! :-) :-*\n\nДержи 50 поинтов на свой баланс!';
}

module.exports = gift;