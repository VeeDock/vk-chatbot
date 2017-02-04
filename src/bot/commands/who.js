'use strict';

/**
 * Module dependencies.
 * @private
 */
const randomElem   = require('./helpers/random-elem');
const conversation = require('../base/modules/conversation');

/**
 * Local constants.
 * @private
 */
const VARIANTS = {
  answerWords: [
    'Я думаю, это %username%', 
    'Определенно, это %username%', 
    'Несомненно, это %username%', 
    'Мне кажется, что это %username%', 
    'По-моему, это %username%', 
    'Скорее всего, это %username%', 
    'Все знают, что это %username%', 
    'Это %username%, без сомнений.', 
    '%username%. Кто ж ещё!', 
    'Кто-кто.. Ты!'
  ], 

  noUsersAnswers: [
    'Не скажу.', 
    'Не хочу говорить.', 
    'У меня нет настроения тебе отвечать.', 
    'Я не хочу тебе отвечать :p'
  ]
};

async function run ({ id, app, args, options }) {
  if (!args.fullText) 
    return;

  let chatUsers = await conversation.getUsers({
    chat_id: args.source.conversation_id, 
    bot_id:  id, 
    app
  });
  let returnAnswer;

  if (chatUsers) {
    // Убираем бота из списка.
    delete chatUsers[id];

    let randomUserName = chatUsers[randomElem(Object.keys(chatUsers))];

    returnAnswer = randomElem(VARIANTS.answerWords).replace(/%username%/, randomUserName);
  } else {
    returnAnswer = randomElem(VARIANTS.noUsersAnswers);
  }

  return {
    message:      returnAnswer, 
    replace_urls: true
  };
}

module.exports = {
  aliases:    ['кто'], 
  help_text:  '/who <текст>\n\nВернёт случайного пользователя из списка участников беседы.', 
  uniqueness: 'mchat', 
  run
};