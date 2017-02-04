'use strict';

/**
 * Local constants.
 * @private
 */
const HTML_ENTITIES = [['&lt;', '<'], ['&gt;', '>'], ['&amp;', '&'], ['&quot;', '"'], ['<br>', '. ']];
const FLAGS         = [33, 49, 545, 561];

/**
 * Собирает объект из массива LongPoll данных.
 * @param  {Array} item
 * @return {Object}
 */
function messageAssembler (item) {
  let attachments = item[7] || {};
  let message     = item[6] || '';
  let messageId   = item[1];
  let fwdMessage  = null;

  let mchatSenderId = parseInt(attachments.from);
  let isMultichat   = mchatSenderId && true || false;

  let conversationId = isMultichat ? (item[3] - 2000000000) : item[3];
  let senderId       = isMultichat ? mchatSenderId : conversationId;

  // Decode some HTML entities.
  for (let i = 0, len = HTML_ENTITIES.length; i < len; i++) 
    message = message.replace(new RegExp(HTML_ENTITIES[i][0], 'g'), HTML_ENTITIES[i][1]);

  // Parse forwarded message for personal chats.
  if (isMultichat && attachments.fwd) {
    if (attachments.fwd.includes(':')) {
      // Пересланных сообщений несколько, возвращаем последнее (т.е. самое новое).
      fwdMessage = attachments[`fwd${attachments.fwd.split(':')[0]}`];
    } else {
      // Пересланное сообщение только одно, возвращаем его.
      fwdMessage = attachments[`fwd${attachments.fwd}`];
    }
  }

  return {
    attachments, 
    message, 
    fwd_message: fwdMessage, 
    message_id: messageId, 
    conversation_id: conversationId, 
    sender_id: senderId, 
    is_multichat: isMultichat
  };
}

/**
 * Обрабатывает LongPoll обновления.
 * @param  {Object} updates
 *   @property {Number} id   ID бота
 *   @property {Array}  data Массив обновлений
 * @param  {Reference}       Ссылка на экземпляр EventEmitter
 * @public
 */
function processor (updates, emitter) {
  for (let item of updates.data) {
    let mchatSenderId = item[7] && item[7].from && parseInt(item[7].from);

    // @todo: Filter multichat messages from non-friends for some bots?

    // Новое сообщение.
    if (
      item[0] === 4 && 
      (
        mchatSenderId && mchatSenderId !== updates.id || 
        FLAGS.includes(item[2])
      )
    ) {
      emitter.emit('message', {
        id:   updates.id, 
        data: messageAssembler(item)
      });

      continue;
    }

    // Друг current[1] стал оффлайн
    // current[2]:
    //   0: вышел сам
    //   1: по таймауту
    // 
    // if (current[0] === 9) {

    // }

    // Информация беседы обновлена.
    // if (item[0] === 51) {
    //   emitter.emit('mchat_updates', {
    //     id:   updates.id, 
    //     data: {
    //       conversation_id: item[1]
    //     }
    //   });

    //   continue;
    // }
  }
}

module.exports = processor;