/*CMD
  command: /reset_all_cancel
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: "❌ <b>Reset Cancelled.</b> Bot data remains untouched.",
  parse_mode: "HTML"
});
