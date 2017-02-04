'use strict';

/**
 * Module dependencies.
 * @private
 */
const conversation = require('../base/modules/conversation');

const accounts = require('../../config/accounts');

/**
 * Беседа только что создана.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function chatCreated ({ id, data, app, user }) {
  let chatUsers = await conversation.getUsers({
    chat_id: data.conversation_id, 
    bot_id:  id, 
    app
  });

  // @todo: greeting (./bot-invited)

  // @todo: ?
  if (!chatUsers) 
    return;

  let userIds = Object.keys(chatUsers);
  let botIds  = Object.keys(accounts);

  let matchesCount = 0;

  for (let botId of botIds) {
    if (userIds.includes(botId)) 
      matchesCount++;

    if (matchesCount > 1) 
      break;
  }

  if (matchesCount > 1) {
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

  return;
}

module.exports = chatCreated;