'use strict';

/**
 * Module dependencies.
 * @private
 */
const path      = require('path');
const constants = require('../../constants');
const config    = require('../../../../config');
const accounts  = require('../../../../config/accounts');

/**
 * Определяет тип парсера.
 * @param {Object}
 *   @property {Number} id   ID бота
 *   @property {Object} data Объект сообщения
 * @return {String/null}
 * @private
 */
function getType ({ id, data }) {
  let attachments = data.attachments;

  if (attachments) {
    if (attachments.attach1_type === 'gift') 
      return constants.PARSER_TYPE_GIFT;

    if (attachments.source_act === 'chat_create') 
      return constants.PARSER_TYPE_CHAT_CREATED;

    if (attachments.source_act === 'chat_invite_user') {
      if (parseInt(attachments.source_mid) !== id) 
        return constants.PARSER_TYPE_USER_INVITED;

      if (data.sender_id !== id) 
        return constants.PARSER_TYPE_BOT_INVITED;
    }

    if (attachments.source_act === 'chat_kick_user') {
      if (parseInt(attachments.source_mid) !== id) 
        return constants.PARSER_TYPE_USER_KICKED;

      if (data.sender_id !== id) 
        return constants.PARSER_TYPE_BOT_KICKED;

      return constants.PARSER_TYPE_BOT_LEFT;
    }

    if (attachments.source_act === 'chat_title_update') 
      return constants.PARSER_TYPE_CHAT_TITLE_UPDATED;

    if (attachments.source_act === 'chat_photo_update') 
      return constants.PARSER_TYPE_CHAT_PHOTO_UPDATED;
  }

  if (/^\//.test(data.message)) 
    return constants.PARSER_TYPE_COMMAND;

  if (data.is_multichat) {
    let pattern = accounts[id].pattern || config.bot.default_pattern;

    if (pattern && pattern.test(data.message)) 
      return constants.PARSER_TYPE_APPEAL;

    return null;
  }

  return constants.PARSER_TYPE_APPEAL;
}

/**
 * Применяет парсер к сообщению.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object}             Результат работы парсера
 * @public
 */
async function processor ({ id, data, app, user }) {
  let parserType = getType({ id, data });

  if (!parserType) 
    return;

  let parser = require(path.join(config.path.parsers, parserType));

  return await parser({ id, data, app, user });
}

module.exports = {
  process: processor
};