'use strict';

/**
 * Module dependencies.
 * @private
 */
const conversation = require('../base/modules/conversation');

/**
 * Из беседы кикнули пользователя.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function userKicked ({ id, data, app, user }) {
  await conversation.updateNeeded({
    chat_id: data.conversation_id, 
    bot_id:  id, 
    app
  });

  return;
}

module.exports = userKicked;