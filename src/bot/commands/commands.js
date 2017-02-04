'use strict';

/**
 * Module dependencies.
 * @private
 */
const randomElem = require('./helpers/random-elem');

async function run ({ id, app, args, options, user }) {
  let cmdList  = app.get('commands');
  let convType = args.source.is_multichat ? 'mchat' : 'pm';

  let availableCommands = [];

  for (let command of cmdList) {
    if (!command.uniqueness || command.uniqueness === convType) {
      if (command.private && !user.is_admin) 
        continue;

      availableCommands.push(command.name);
    }
  }

  return `Список команд, доступных в ${convType === 'pm' ? 'личных сообщениях' : 'беседе'}:\n\n` + 
         `/${availableCommands.join('\n/')}\n\n` + 
         'Чтобы получить помощь по определенной команде, напишите в чат: <<команда /?>>. ' + 
         `Например: /${randomElem(availableCommands)} /?`;
}

module.exports = {
  aliases:   ['команды'], 
  help_text: '/commands\n\nВыводит список доступных команд.', 
  run
}