'use strict';

/**
 * Module dependencies.
 * @private
 */
const conversation = require('../base/modules/conversation');
const redis        = require('../../database/redis');

async function run ({ id, app, args, options }) {
  let argText = args.fullText;
  let chatId  = args.source.conversation_id;

  if (!argText) 
    return;

  let _args = argText.split('@');

  if (_args.length < 2) 
    return 'Вопрос и ответы должны быть разделены символом @.';

  let question = _args[0].trim();
  let answers  = _args[1].trim().split(' ');

  if (answers.length < 2) 
    return 'Укажите как минимум 2 варианта ответа.';

  let isOk = await conversation.setMode({
    chat_id: chatId, 
    bot_id:  id, 
    mode:    'vote'
  });

  if (!isOk) 
    return 'Не удалось создать голосование, попробуйте немного позже.';

  // Будем хранить результаты голосования в памяти (options.duration + 1) минут.
  await redis.call('expire', `votes:${chatId}:${id}`, (options.duration + 1) * 60);

  setTimeout(async () => {
    let results = await redis.call('hgetall', `votes:${chatId}:${id}`);

    let message = '';

    if (results && Object.keys(results).length) {
      let votes      = [];
      let indanswers = [];
      let votesCount = 0;

      for (let userId of Object.keys(results)) {
        let choiceNumber = results[userId];

        votes[choiceNumber - 1] = (votes[choiceNumber - 1] || 0) + 1;
        votesCount += 1;
      }

      // Собираем массив ответов с количеством голосов.
      for (let i = 0, len = answers.length; i < len; i++) 
        indanswers.push([votes[i] || 0, answers[i]]);

      // Сортируем голоса по убыванию.
      indanswers = indanswers.sort((a, b) => a[0] > b[0] && -1 || a[0] < b[0] && 1 || 0);

      // Собираем ответ для отправки.
      message = indanswers.map((value, index) => `${(index + 1)}. ${value[1]} (${Math.round(value[0] * 100 / votesCount)}%)`).join('\n');
    } else {
      message = 'Результатов нет ¯\\_(ツ)_/¯';
    }

    // Помещаем сообщение в очередь.
    app.get('queue', id).enqueueTo(0, {
      chat_id: chatId, 
      message: 'Голосование завершено. Результаты: \n\n' + message
    });

    // Возвращаем стандартный режим беседы.
    await conversation.unsetMode({
      chat_id: chatId, 
      bot_id:  id
    });

    return;
  }, 1000 * 60 * options.duration);

  return {
    message: question + '\n\n' + 
             answers.map((value, index) => `${(index + 1)}. ${value}`).join('\n') + '\n\n' + 
             'Чтобы проголосовать, отправьте в чат номер варианта.\n' + 
             `Голосование продлится ровно ${options.duration} минуты.\n\n` + 
             'Во время голосования бот не выполняет никаких команд.', 
    forward: false
  };
}

module.exports = {
  aliases:    ['голосование'], 
  help_text:  '/vote <вопрос> @ <ответ_1> <ответ_2> [ответ_3] [ответ_4] [ответ_5]\n\n' + 
              'Позволяет провести голосование прямо в беседе.', 
  price: 1, 
  uniqueness: 'mchat', 
  run
};