'use strict';

/**
 * Module dependencies.
 * @private
 */
const randomElem   = require('./helpers/random-elem');
const conversation = require('../base/modules/conversation');
const executables  = require('../base/modules/executables');

/**
 * Local constants.
 * @private
 */
const ONLINE_FLAGS = ['-online', '-on', '-онлайн'];

async function run ({ id, app, args, options }) {
  let VK             = app.get('api', id);
  let chatUsers      = await conversation.getUsers({
    chat_id: args.source.conversation_id, 
    bot_id:  id, 
    app
  });
  let userId         = args.firstWord;
  let needToBeOnline = false;

  // Беседа переполнена.
  if (chatUsers && Object.keys(chatUsers).length === 50) 
    return;

  // Первый аргумент указывает на то, что нужно приглашать только онлайн-юзеров.
  if (ONLINE_FLAGS.includes(userId)) {
    userId = null;
    needToBeOnline = true;
  }

  // ID содержит только цифры.
  if (/^\d+$/.test(userId)) {
    // Юзер уже состоит в беседе.
    if (Object.keys(chatUsers).includes(userId)) 
      return 'Этот пользователь уже состоит в беседе.';

    userId = 'id' + userId;
  }

  // ID пользователя не указан, либо был указан параметр "-online".
  if (!userId) {
    // Получаем 500 случайных друзей.
    return await VK.call('friends.get', {
      order:  'random', 
      count:  500, 
      fields: 'online'
    })
    .then(response => {
      let friends = [];

      for (let item of response.items) {
        // Убедимся в том, что пользователя нет в беседе и его статус соответствует желаемому.
        if (!Object.keys(chatUsers).includes(item.id.toString()) && item.online >= +needToBeOnline) 
          friends.push(item.id);
      }

      // Не нашлось ни одного подходящего пользователя.
      if (!friends.length) 
        return 'Не удалось найти подходящего пользователя. Повторите запрос позже.';

      // Добавляем пользователя в беседу.
      return VK.call('messages.addChatUser', {
        chat_id: args.source.conversation_id, 
        user_id: randomElem(friends)
      }).then(() => null);
    })
    .catch(error => {
      // @todo: Log error

      return 'Произошла неизвестная ошибка. Повторите запрос позже.';
    });
  }

  // ID не может содержать русских (и прочих) символов.
  if (!/^[a-z0-9_\.]*$/i.test(userId)) 
    return;

  // Приглашаем по ID.
  return await VK.call('execute', { code: executables.inviteById({ chat_id: args.source.conversation_id, user_id: userId }) })
    .then(() => null)
    .catch(error => {
      // @todo: Log error

      return 'Не удалось добавить пользователя в беседу.';
    });
}

module.exports = {
  aliases:    ['пригласи'], 
  help_text:  `/invite [user_id | ${ONLINE_FLAGS.join(' | ')}]\n\nПриглашает в беседу друга бота.`, 
  price:      2, 
  uniqueness: 'mchat', 
  run
};