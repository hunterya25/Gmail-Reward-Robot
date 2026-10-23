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

var chs = Bot.getProperty("mandatory_channels");
if (!chs || !Array.isArray(chs) || chs.length === 0) {
  chs = [Bot.getProperty("mandatory_channel", "@BotsByAntares")];
}

if (request && request.id) {
  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: "🔍 Checking channels membership...",
      show_alert: false
    });
  } catch (e) {}
}

Api.getChatMember({
  chat_id: chs[0],
  user_id: user.telegramid,
  on_result: "/on_check_join 0",
  on_error: "/on_check_join_error"
});
