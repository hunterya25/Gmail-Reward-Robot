/*CMD
  command: /view_banned
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

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized: Admin access only!</b>", { parse_mode: "HTML" });
  return;
}

var chatId = chat ? chat.chatid : user.telegramid;

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var bannedList = Bot.getProperty("BannedUsersList") || [];
var bText = "⛔ <b>Banned Accounts Directory</b> (" + bannedList.length + ")\n\n";

if (bannedList.length === 0) {
  bText += "<i>No users are currently permanently banned.</i>\n\n";
} else {
  for (var i = 0; i < bannedList.length; i++) {
    var bId = bannedList[i];
    bText += "<b>#" + (i + 1) + " Telegram ID:</b> <code>" + bId + "</code>\n" +
      "⚡ <b>Action:</b> <code>/unban " + bId + "</code>\n\n";
  }
}

var kbd = [
  [{ text: "👥 Users Division", callback_data: "/admin_users" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: bText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
