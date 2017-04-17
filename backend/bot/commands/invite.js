'use strict';

/**
 * Module dependencies.
 * @private
 */
const randomElem   = require('./helpers/random-elem');
const Conversation = require('../base/Bot/Messages/Conversation');

/**
 * Local constants.
 * @private
 */
const ONLINE_FLAGS = ['-online', '-on', '-онлайн'];

async function run ({ bot, args, options }) {
  const chatUsers      = await Conversation.getUsers(bot.id, args.source.conversation_id);
  const needToBeOnline = ONLINE_FLAGS.includes(args.firstWord);

  // Беседа переполнена.
  if (chatUsers && Object.keys(chatUsers).length === 50) 
    return;

  // Получаем 500 случайных друзей.
  return bot.api.call('friends.get', {
    order:  'random', 
    count:  500, 
    fields: 'online'
  })
  .then(response => {
    const friends = [];

    for (let item of response.items) {
      // Убедимся в том, что пользователя нет в беседе и его статус соответствует желаемому.
      if (!Object.keys(chatUsers).includes(item.id.toString()) && item.online >= +needToBeOnline) 
        friends.push(item.id);
    }

    // Не нашлось ни одного подходящего пользователя.
    if (!friends.length) 
      return 'Не удалось найти подходящего пользователя. Повторите запрос позже.';

    // Добавляем пользователя в беседу.
    return bot.api.call('messages.addChatUser', {
      chat_id: args.source.conversation_id, 
      user_id: randomElem(friends)
    }).then(() => null);
  });
}

module.exports = {
  aliases:    ['пригласи'], 
  help_text:  `/invite [user_id | ${ONLINE_FLAGS.join(' | ')}]\n\nПриглашает в беседу друга бота.`, 
  uniqueness: 'mchat', 
  run
}