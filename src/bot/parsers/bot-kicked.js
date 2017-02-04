'use strict';

/**
 * Module dependencies.
 * @private
 */
const conversation = require('../base/modules/conversation');

/**
 * Бота кикнули из беседы.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function botKicked ({ id, data, app, user }) {
  app.get('queue', id).clear(data.conversation_id);

  await conversation.updateNeeded({
    chat_id: data.conversation_id, 
    bot_id:  id, 
    app
  });

  return;
}

module.exports = botKicked;