'use strict';

async function run ({ id, app, args, options }) {
  let VK = app.get('api', id);

  return await VK.call('messages.removeChatUser', {
      chat_id: args.source.conversation_id, 
      user_id: id
    })
    .then(() => {
      // Удаляем сообщения из очереди для этой беседы.
      app.get('queue', id).clear(args.source.conversation_id);

      return;
    })
    .catch(() => {
      // @todo: Log error

      return;
    });
}

module.exports = {
  aliases:    ['выйди'], 
  help_text:  '/goaway\n\nПо этой команде бот сам выходит из чата.', 
  private:    true, 
  uniqueness: 'mchat', 
  run
};