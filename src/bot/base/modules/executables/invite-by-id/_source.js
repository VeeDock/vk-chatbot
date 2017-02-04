var userId = <user_id>;
var chatId = <conversation_id>;

var id = API.utils.resolveScreenName({ screen_name: userId });

if (id.type == "user") {
  API.messages.addChatUser({ chat_id: chatId, user_id: id.object_id });
  return "ok";
} else {
  return "failed";
}