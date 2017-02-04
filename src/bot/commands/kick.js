'use strict';

/**
 * Module dependencies.
 * @private
 */
const conversation = require('../base/modules/conversation');

async function run ({ id, app, args, options }) {
  let VK        = app.get('api', id);
  let userId    = args.firstWord;
  let chatUsers = await conversation.getUsers({
    chat_id: args.source.conversation_id, 
    bot_id:  id, 
    app
  });

  // ID не может содержать русских (и прочих) символов.
  if (!userId || !/^[a-z0-9_\.]*$/i.test(userId)) 
    return;

  // Если ID состоит только из цифр, то добавляем префикс "id".
  if (/^\d+$/.test(userId)) 
    userId = 'id' + userId;

  // Список участников беседы пуст.
  if (!chatUsers) 
    return;

  return await VK.call('utils.resolveScreenName', { screen_name: userId })
    .then((response = {}) => {
      if (response.type !== 'user') 
        return 'Данного пользователя не существует.';

      let user_id = response.object_id;

      if (!chatUsers[user_id]) 
        return 'Данного пользователя нет в беседе, либо список участников ещё не обновился.';

      return VK.call('messages.removeChatUser', {
        chat_id: args.source.conversation_id, 
        user_id
      }).then(() => null);
    })
    .catch(error => {
      // Access denied.
      if (error.name === 'VKApiError' && error.code === 15) 
        return 'К сожалению, я не могу исключить из беседы этого пользователя.';

      // @todo: Log error

      return 'Произошла неизвестная ошибка. Повторите запрос позже.';
    });
}

module.exports = {
  help_text:  '/kick <user_id>\n\nКикает пользователя из чата.', 
  private:    true, 
  uniqueness: 'mchat', 
  run
};