'use strict';

// @todo: make it accessable in parser functions? (with bound bot_id)

/**
 * Module dependencies.
 * @private
 */
const redis = require('../../../../database/redis');

/**
 * Возвращает режим диалога.
 * @param {Object}
 *   @property {Number} chat_id ID диалога
 *   @property {Number} bot_id  ID бота
 * @return {String}
 * @public
 */
async function getMode ({ chat_id, bot_id }) {
  return await redis.call('get', `conversation:mode:${chat_id}:${bot_id}`);
}

/**
 * Устанавливает режим диалога.
 * @param {Object}
 *   @property {Number} chat_id ID диалога
 *   @property {Number} bot_id  ID бота
 *   @property {String} mode    Режим
 * @return {String}
 * @public
 */
async function setMode ({ chat_id, bot_id, mode }) {
  return await redis.call('set', `conversation:mode:${chat_id}:${bot_id}`, mode);
}

async function unsetMode ({ chat_id, bot_id }) {
  return await redis.call('del', `conversation:mode:${chat_id}:${bot_id}`);
}

/**
 * Возвращает список участников беседы.
 * @param {Object}
 *   @property {Number}    chat_id ID диалога
 *   @property {Number}    bot_id  ID бота
 *   @property {Reference} app     Ссылка на экземпляр Application
 * @return {String}
 * @public
 */
async function getUsers ({ chat_id, bot_id, app }) {
  let chatUsers = await redis.call('hgetall', `conversation:users:${chat_id}:${bot_id}`);

  if (chatUsers && Object.keys(chatUsers).length) 
    return chatUsers;

  let VK    = app.get('api', bot_id);
  let users = await VK.call('messages.getChatUsers', {
    chat_id, 
    fields: 'first_name'
  }).then(response => chatUsersArrayToObj(response)).catch(error => null);

  if (users) {
    if (!Object.keys(users).length) {
      app.get('queue', bot_id).clear(chat_id);

      await redis.call('del', `conversation:users:${chat_id}:${bot_id}`);
    } else {
      await redis.call('hmset', `conversation:users:${chat_id}:${bot_id}`, users);
    }
  }

  return users;
}

/**
 * 
 * @param {Object}
 *   @property {Number}    chat_id ID диалога
 *   @property {Number}    bot_id  ID бота
 *   @property {Reference} app     Ссылка на экземпляр Application
 * @return {String}
 * @public
 */
async function updateNeeded ({ chat_id, bot_id, app }) {
  await redis.call('set', `conversation:update_needed:${chat_id}:${bot_id}`, '1');

  let chatIdsToUpdate = await redis.call('keys', `conversation:update_needed:*:${bot_id}`);

  if (chatIdsToUpdate.length >= 10) 
    performUpdates({ keys: chatIdsToUpdate, app });

  return;
}

async function performUpdates ({ keys, app }) {
  let botId = keys[0].split(':')[3];
  let VK    = app.get('api', botId);

  let chatIds = keys.map(v => v.split(':')[2]).join(',');

  await VK.call('messages.getChatUsers', {
    chat_ids: chatIds, 
    fields: 'first_name'
  }).then(async response => {
    if (!response || !Object.keys(response).length) 
      return;

    await redis.call('del', ...keys);

    Object.keys(response).forEach(async chatId => {
      let users = chatUsersArrayToObj(response[chatId]);

      if (!Object.keys(users).length) {
        app.get('queue', botId).clear(chatId);

        await redis.call('del', `conversation:users:${chatId}:${botId}`);
      } else {
        await redis.call('hmset', `conversation:users:${chatId}:${botId}`, users);
      }

      return;
    });

    return;
  }).catch(error => null);

  return;
}

/**
 * Users array to object
 * @param  {Array}  usersArray
 * @return {Object}
 * @private
 */
function chatUsersArrayToObj (usersArray = []) {
  if (!usersArray.length) 
    return {};

  let output = {};

  for (let user of usersArray) 
    output[user.id] = user.first_name + ' ' + user.last_name;

  return output;
}


module.exports = {
  getMode, 
  setMode, 
  unsetMode, 

  getUsers, 

  updateNeeded
};