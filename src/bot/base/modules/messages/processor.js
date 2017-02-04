'use strict';

/**
 * Module dependencies.
 * @private
 */
const path    = require('path');
const parser  = require('./parser');
const builder = require('./builder');
const limits  = require('../limits');

const User  = require('../../../../database/models/user');

const conversation = require('../conversation');
const config       = require('../../../../config');

/**
 * Обрабатывает переданное сообщение.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 * @return {Object}             Результат работы
 * @public
 */
async function processor ({ id, data, app }) {
  let user = await User.get(data.sender_id);

  // Объект пользователя не получен, либо пользователь заблокирован.
  if (!user || user.is_banned) 
    return;

  let customParser;

  let chatMode = await conversation.getMode({
    chat_id: data.conversation_id, 
    bot_id:  id
  });

  if (chatMode) 
    customParser = require(path.join(config.path.modes, chatMode));

  // Не считаем лимиты для кастомных парсеров и админов.
  if (!customParser && !user.is_admin) {
    let messagesLimitStatus = await limits.get({
      key:   'message', 
      id:    data.sender_id, 
      botId: id
    });

    // Если лимит превышен, сообщения не обрабатываются.
    if (messagesLimitStatus.status === 'reached') 
      return;
  }

  let parserResult = await (customParser || parser).process({ id, data, app, user });

  if (!parserResult) 
    return;

  let messageObjectBuilded = builder(parserResult, data);

  if (!messageObjectBuilded) {
    // @todo: Unanswered messages count > X?

    return;
  }

  if (!customParser && !user.is_admin) {
    let messagesLimitStatus = await limits.incr({
      key:   'message', 
      id:    data.sender_id, 
      botId: id
    });

    if (messagesLimitStatus.status === 'reached') {
      // @todo: Use `date-fns` to format time remaining?
      messageObjectBuilded.message += '\n\nВы достигли лимита на кол-во отправленных сообщений боту.\n' + 
                                      `Вы сможете отправлять сообщения боту снова через ${messagesLimitStatus.ttl} секунд.`;
    }
  }

  let queue = app.get('queue', id);

  // Сообщения администраторов обрабатываются в первую очередь.
  if (user.is_admin) {
    queue.enqueueTo(0, messageObjectBuilded);
  } else {
    queue.enqueue(messageObjectBuilded);
  }
}

module.exports = processor;