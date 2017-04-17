'use strict';

/**
 * Module dependencies.
 * @private
 */
const log = require('../../../../../lib/logger')('bot', __filename);

/**
 * Отправляет сообщение.
 * @param   {Bot}     bot           Экземпляр "Bot"
 * @param   {Object}  messageObject Объект сообщения, готовый к отправке
 * @return  {Promise}
 * @private
 */
function sendMessage (bot, messageObject) {
  return bot.api.call('messages.send', messageObject)
    .catch(error => {
      if (error.name === 'VKApiError') {
        // Флуд-контроль. Добавляем в конец сообщения смайлик и отправляем запрос снова.
        if (error.code === 9) {
          messageObject.message = messageObject.message + ' 😊';

          return sendMessage(bot, messageObject);
        }

        // Внутрення серверная ошибка, отправлять по-новой ничего не будем.
        if (error.code === 10) 
          return;
      }

      log.error('Unable to send message.', error);

      return;
    });
}

module.exports = {
  send: sendMessage
}