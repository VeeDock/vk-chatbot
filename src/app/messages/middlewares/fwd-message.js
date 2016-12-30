'use strict';

/**
 * Добавляет свойство fwdMessage, которое содержит последнее пересланное 
 * сообщение из цепочки. (т.е. то сообщение, текст которого виден).
 *
 * * Только для текстовых персональных сообщений.
 *
 * @param {Obejct} messageObj Объект сообщения
 * @public
 *
 * Функции передаётся контекст (this) класса Bot (./bot/Bot.js)
 */
function middleware (messageObj) {
  let attachments = messageObj.attachments;
  let message     = null;

  if (!messageObj.isMultichat && attachments.fwd) {
    if (!~attachments.fwd.indexOf(':')) {
      // Пересланное сообщение только одно, возвращаем его
      message = attachments[`fwd${attachments.fwd}`];
    } else {
      // Пересланных сообщений несколько, возвращаем последнее (т.е. самое новое)
      let fwd = attachments.fwd.split(':')[0];

      message = attachments[`fwd${fwd}`];
    }
  }

  return {
    fwdMessage: message || null
  }
}

module.exports = middleware;