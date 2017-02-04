'use strict';

/**
 * Module dependencies.
 * @private
 */
const commandParser = require('./command');
const cleverbot     = require('./helpers/cleverbot');
const config        = require('../../config');

/**
 * Appeal
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function appeal ({ id, data, app, user }) {
  let message = data.message;

  // Устанавливаем статус набора текста "<Бот> печатает...".
  app.get('api', id).call('messages.setActivity', {
    type:    'typing', 
    peer_id: data.is_multichat ? (data.conversation_id + 2000000000) : data.sender_id
  }).then(response => null).catch(error => null);

  if (data.is_multichat) {
    // Для сообщений в беседах удаляем из текста обращение к боту.
    message = message.replace(/^[^\s,]+[\s,]+/, '').trim();

    /**
     * Попытаемся выполнить команду, вызванную в "разговорной форме". 
     * Например:
     * >> "Бот, когда ответишь?"
     * "когда" здесь - команда "/when" (./commands/when.js).
     */

    let objectToParse = Object.assign({}, { id, data, app, user });
        objectToParse.data.message = '/' + message;

    let commandParserResult = await commandParser(objectToParse);

    if (commandParserResult) 
      return commandParserResult;
  }

  // Сообщение не содержит ни одного русского символа. Ничего отвечать не будем.
  if (!/[а-яё]/ig.test(message)) 
    return;

  // Получаем ответ на сообщение от cleverbot.
  return await cleverbot.send({
      user: config.api.cleverbot, 
      message: {
        text: message.slice(0, 250)
      }
    })
    .then(cleverbotResponse => {
      let reply = cleverbotResponse.response;

      // Не пришло внятного ответа. Или от cleverbot.com пришло рекламное сообщение.
      if (!reply || /(?:botlike|clever|real person)/.test(reply.toLowerCase())) {
        // @todo: Get answer from local database?

        return;
      }

      // Ответ пришёл и он нормальный. 
      // Удаляем точку в конце предложения, ибо cleverbot любит 
      // ставить точки даже в конце вопросительных предложений.
      if (reply.endsWith('.')) 
        reply = reply.slice(0, -1);

      return {
        message:      reply, 
        replace_urls: true
      };
    })
    .catch(cleverbotError => {
      // @todo: Log error
      // @todo: Get answer from local database?

      return;
    });
}

module.exports = appeal;