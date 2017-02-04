'use strict';

/**
 * Sender
 * @param  {Object}    messageObject Объект сообщения
 * @param  {Reference} api           Cсылка на экземпляр VKApi
 * @return {Promise}
 */
function sender (messageObject, api) {
  return api.call('messages.send', messageObject)
    .catch(error => {
      if (error.name === 'VKApiError') {
        // Флуд-контроль. Добавляем в конец сообщения смайлик и отправляем запрос снова.
        if (error.code === 9) {
          messageObject.message = messageObject.message + ' 😊';

          return sender(messageObject, api);
        }

        // Внутрення серверная ошибка, отправлять по-новой ничего не будем.
        if (error.code === 10) 
          return;

        // Captcha needed.
        if (error.code === 14) 
          throw error;
      }

      // @todo: Log error

      return;
    });
}

module.exports = sender;