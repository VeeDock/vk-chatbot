'use strict';

/**
 * Module dependencies.
 * @private
 */
const conversation = require('../base/modules/conversation');

const accounts = require('../../config/accounts');

/**
 * В беседу пригласили пользователя.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function inviteUser ({ id, data, app, user }) {
  // В беседу был приглашён ещё один наш бот. 
  // Старый бот выходит, новый остаётся.
  if (Object.keys(accounts).includes(data.attachments.source_mid)) {
    let VK = app.get('api', id);

    await (function leaveChat () {
      return VK.call('messages.removeChatUser', {
        chat_id: data.conversation_id, 
        user_id: id
      })
      .catch(error => leaveChat());
      // @todo: Log error
    })();
  }

  await conversation.updateNeeded({
    chat_id: data.conversation_id, 
    bot_id:  id, 
    app
  });

  return;
}

module.exports = inviteUser;