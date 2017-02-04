'use strict';

/**
 * Module dependencies.
 * @private
 */
const conversation = require('../base/modules/conversation');
const executables  = require('../base/modules/executables');

async function run ({ id, app, args, options }) {
  let VK = app.get('api', id);

  return await VK.call('messages.getChatUsers', {
    chat_id: args.source.conversation_id, 
    fields: 'invited_by'
  })
  .then(response => {
    if (!response.length) 
      return;

    let canBeKicked = [];

    for (let user of response) {
      if (user.id === id || user.id === args.source.sender_id) 
        continue;

      if (user.invited_by === id) 
        canBeKicked.push(user.id);

      if (canBeKicked.length === 25) 
        break;
    }

    if (!canBeKicked.length) 
      return 'Я не могу никого выгнать из этой беседы :(';

    return VK.call('execute', { code: executables.kickAll({ chat_id: args.source.conversation_id, users: canBeKicked }) })
      .then(response => null)
      .catch(error => {
        // @todo: Log error

        return 'Произошла неизвестная ошибка, повторите запрос позже.';
      });
  });
}

module.exports = {
  help_text:  '/kickall\n\nКикает участников беседы, приглашенных ботом.', 
  private:    true, 
  uniqueness: 'mchat', 
  run
}