'use strict';

/**
 * Module dependencies.
 * @private
 */
const path         = require('path');
const buildMessage = require('./builder');
const config       = require('../../../../../config');

/**
 * Обрабатывает переданное сообщение.
 * @param {Object}
 *   @property {Bot}    bot           Экземпляр "Bot"
 *   @property {Object} messageObject Объект сообщения
 * @return {Object}
 * @public
 */
async function process (bot, messageObject) {
  const eventType = getEventType(bot, messageObject);

  if (!eventType) 
    return;

  const eventHandler = require(path.join(config.path.events, eventType));
  const handleResult = await eventHandler(bot, messageObject);

  if (!handleResult) 
    return;

  return buildMessage(handleResult, messageObject);
}

/**
 * Определяет тип события.
 * @param   {Bot}         bot           Экземпляр "Bot"
 * @param   {Object}      messageObject Объект сообщения
 * @return  {String/null}
 * @private
 *
 * Возможные события:
 *   appeal                 Пользователь обратился к боту
 *   command                Пользователь прислал команду
 *   gift                   Боту прислали подарок
 *   bot-invited            В беседу был приглашён бот
 *   bot-kicked             Из беседы был исключён бот
 *   bot-left               Из беседы бот вышел сам
 *   chat-created           Была создана беседа вместе с ботом
 *   chat-title-updated     Было изменено название беседы
 *   chat-photo-updated     Было изменено изображение беседы
 *   user-invited           В беседу был приглашён пользователь
 *   user-kicked            Из беседы был исключён пользователь
 */
function getEventType (bot, messageObject) {
  const attachments = messageObject.attachments;

  if (attachments) {
    if (attachments.attach1_type === 'gift') 
      return 'gift';

    if (attachments.source_act === 'chat_create') 
      return 'chat-created';

    if (attachments.source_act === 'chat_invite_user') {
      if (parseInt(attachments.source_mid) !== bot.id) 
        return 'user-invited';

      if (messageObject.sender_id !== bot.id) 
        return 'bot-invited';
    }

    if (attachments.source_act === 'chat_kick_user') {
      if (parseInt(attachments.source_mid) !== bot.id) 
        return 'user-kicked';

      if (messageObject.sender_id !== bot.id) 
        return 'bot-kicked';

      return 'bot-left';
    }

    if (attachments.source_act === 'chat_title_update') 
      return 'chat-title-updated';

    if (attachments.source_act === 'chat_photo_update') 
      return 'chat-photo-updated';
  }

  if (/^\//.test(messageObject.message)) 
    return 'command';

  if (messageObject.is_multichat) {
    let pattern = bot.pattern || config.bot.default_pattern;

    if (pattern && pattern.test(messageObject.message)) 
      return 'appeal';

    return null;
  }

  return 'appeal';
}

module.exports = {
  process
}