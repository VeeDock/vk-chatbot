'use strict';

/**
 * Module dependencies.
 * @private
 */
const urlReplacer = require('./url-replacer');

/**
 * Собирает объект сообщения к отправке. 
 * @param  {Object/String} resultObject  Объект, который вернул парсер
 * @param  {Object}        messageObject Исходный объект сообщения
 * @return {Object}
 * @public
 */
function builder (resultObject = {}, messageObject = {}) {
  if (typeof resultObject === 'string') {
    resultObject = {
      message: resultObject
    };
  }

  let _to   = messageObject.is_multichat ? 'chat_id' : 'user_id';
  let _toId = messageObject.conversation_id;

  let _message = resultObject.message || '';

  if (_message && resultObject.replace_urls) 
    _message = urlReplacer.replace(_message);

  let _attachments = resultObject.attachments || '';

  if (_attachments && Array.isArray(_attachments)) 
    _attachments = _attachments.join(',');

  let _forwards = resultObject.forward_messages || '';

  if (_forwards && Array.isArray(_forwards)) 
    _forwards = _forwards.join(',');

  if (!_forwards) {
    if (resultObject.forward === true) 
      _forwards = messageObject.message_id;

    if (resultObject.forward === undefined) 
      _forwards = messageObject.is_multichat ? messageObject.message_id : '';
  }

  // Нечего отправлять.
  if (!(_message || _attachments || _forwards)) 
    return null;

  return {
    [_to]: _toId,
    message: _message, 
    attachment: _attachments, 
    forward_messages: _forwards
  };
}

module.exports = builder;