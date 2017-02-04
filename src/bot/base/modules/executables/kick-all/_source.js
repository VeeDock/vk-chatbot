var userIds = [<user_id>, ...];
var chatId = <chat_id>;

while (userIds.length > 0) {
  API.messages.removeChatUser({ chat_id: chatId, user_id: userIds.pop() });
}

return "ok";