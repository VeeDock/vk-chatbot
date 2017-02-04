'use strict';

/**
 * Бота пригласили в беседу.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function inviteBot ({ id, data, app, user }) {
  app.get('queue', id).enqueueTo(0, {
    chat_id: data.conversation_id, 
    message: 'Привет!\n\n' + 
             'Я -- чат-бот от паблика <<Чат-боты>> (vk.com/botsforchats).\n' + 
             'Умею общаться и выполнять команды.\n\n' + 
             'Чтобы получить помощь, напишите в чат <</помощь>> (или <</help>>).', 
  });

  return;
}

module.exports = inviteBot;