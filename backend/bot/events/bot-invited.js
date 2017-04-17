'use strict';

/**
 * Бота пригласили в беседу.
 * @param  {Bot}    bot     Экземпляр "Bot"
 * @param  {Object} message Объект сообщения
 * @public
 */
async function handler (bot, message) {
  return 'Привет!\n\n' + 
         'Я -- чат-бот от паблика <<Чат-боты>> (vk.com/botsforchats).\n' + 
         'Умею общаться и выполнять команды.\n\n' + 
         'Чтобы получить помощь, напишите в чат <</помощь>> (или <</help>>).';
}

module.exports = handler;