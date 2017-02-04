'use strict';

/**
 * Module dependencies.
 * @private
 */
const path             = require('path');
const CommandArguments = require('./helpers/command-arguments');
const limits           = require('../base/modules/limits');
const config           = require('../../config');

const User = require('../../database/models/user');

/**
 * Command
 * @param {Object}
 *   @property {Number}    id   ID бота
 *   @property {Object}    data Объект сообщения
 *   @property {Reference} app  Ссылка на экземпляр Application
 *   @property {Object}    user Объект пользователя
 * @return {Object/String}
 * @public
 */
async function command ({ id, data, app, user }) {
  let commands = app.get('commands');
  let cmd      = data.message.split(' ')[0].substr(1).toLowerCase();
  let convType = data.is_multichat ? 'mchat' : 'pm';

  let cmdToUse;
  let cmdToUseName;
  let canUse = true;

  // Пробегаемся по списку команд и вычисляем, существует ли вызванная команда. 
  // Проверяем соответствие уникальности для найденной команды.
  for (let command of commands) {
    if (
      (command.name === cmd || command.aliases.includes(cmd)) && 
      (!command.uniqueness || command.uniqueness === convType)
    ) {
      cmdToUse     = require(path.join(config.path.commands, command.name));
      cmdToUseName = command.name;

      break;
    }
  }

  // Такой команды не существует или её нельзя использовать.
  if (!cmdToUse) 
    return;

  let args = new CommandArguments(data);

  // Если первый аргумент команды = '/?', то выводим помощь по ней.
  if (args.firstWord === '/?') {
    let helpText = cmdToUse.help_text || '';

    if (cmdToUse.price) 
      helpText += '\n\nСтоимость использования: ' + cmdToUse.price;

    if (cmdToUse.aliases && cmdToUse.aliases.length) 
      helpText += '\n\nАлиасы: /' + cmdToUse.aliases.join(', /');

    helpText = helpText || 'Описание к этой команде отсутствует.';

    return helpText;
  }

  if (!user.is_admin) {
    let commandLimitStatus = await limits.get({
      key: `command:${cmdToUseName}`, 
      id:  data.sender_id
    });

    // @todo: notify if command global limit reached

    // Лимит превышен, команды не обрабатываются.
    if (commandLimitStatus.status === 'reached') 
      return;
  }

  // Проверим, может ли пользователь вызвать данную команду.
  if (cmdToUse.price && !user.is_admin) {
    // У пользователя не хватает поинтов для вызова команды.
    if (cmdToUse.price > user.points_count) {
      return 'Недостаточно средств для использования команды.\n\n' + 
             'Стоимость использования команды: ' + cmdToUse.price + '\n' + 
             'Ваш баланс: ' + user.points_count;
    }
  }

  // Приватные команды только для админов.
  if (cmdToUse.private && !user.is_admin) 
    return;

  return await cmdToUse.run({ id, app, args, options: (config.commands[cmdToUseName] || {}), user })
    .then(async result => {
      if (!result) 
        return;

      let messageAddings = '';

      if (cmdToUse.price && !user.is_admin) {
        // Спишем плату за использование команды.
        let isOk = await User.upd(data.sender_id, { $inc: { points_count: -cmdToUse.price } });

        // Средства списать не удалось.
        if (!isOk) 
          return 'К сожалению, сейчас эта команда не может быть использована.';

        messageAddings += `\n\nВаш баланс: ${user.points_count-cmdToUse.price} (-${cmdToUse.price})`;
      }

      if (!user.is_admin) {
        let commandLimitStatus = await limits.incr({
          key: `command:${cmdToUseName}`, 
          id:  data.sender_id
        });

        // Если лимит достигнут, сообщим об этом пользователю.
        // @todo: Use `date-fns` to format time remaining?
        if (commandLimitStatus === 'reached') {
          messageAddings += '\n\nВы достигли лимита на кол-во вызовов данной команды.\n' + 
                            `Вы сможете снова вызывать эту команду через ${commandLimitStatus.ttl} секунд.`;
        }
      }

      if (typeof result === 'string') 
        result += messageAddings;
      else 
        result.message = (result.message || '') + messageAddings;

      return result;
    });
}

module.exports = command;