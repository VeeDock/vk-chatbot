'use strict';

/**
 * Название беседы изменено.
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function chatTitleUpdated ({ id, data, app, user }) {
  return;
}

module.exports = chatTitleUpdated;