/*CMD
  command: /check_join
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Channel

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var channelUsername = Bot.getProperty("mandatory_channel", "@BotsByAntares");

if (request && request.id) {
  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: "🔍 Checking channel membership...",
    show_alert: false
  });
}

Api.getChatMember({
  chat_id: channelUsername,
  user_id: user.telegramid,
  on_result: "/on_check_join",
  on_error: "/on_check_join_error"
});
