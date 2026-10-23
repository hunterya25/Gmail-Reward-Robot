/*CMD
  command: /my_mails
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

if (request && request.id) {
  Api.answerCallbackQuery({ callback_query_id: request.id });
}

var userMails = User.getProperty("MyClaimedGmails");

if (!userMails || !Array.isArray(userMails) || userMails.length === 0) {
  var emptyText = "📭 <b>No Gmail Accounts Claimed Yet!</b>\n\n" +
    "You haven't redeemed any Gmail accounts yet.\n" +
    "Earn credits by sharing your referral link and claim your first Gmail!";

  var kbd = [[{ text: "👥 Refer & Earn", callback_data: "/refer" }]];
  Api.sendMessage({
    chat_id: chatId,
    text: emptyText,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: kbd }
  });
  return;
}

var msg = "📜 <b>Your Claimed Gmail Accounts (" + userMails.length + ")</b> 📬\n\n";

for (var i = 0; i < userMails.length && i < 10; i++) {
  var m = userMails[i];
  msg += "<b>#" + (i + 1) + " Account:</b>\n" +
    "📧 <code>" + m.email + "</code>\n" +
    "🔑 <code>" + m.password + "</code>\n" +
    "📅 <i>Claimed: " + (m.claimed_at || "N/A") + "</i>\n\n";
}

if (userMails.length > 10) {
  msg += "<i>...and " + (userMails.length - 10) + " older accounts.</i>\n\n";
}

var kbd = [[{ text: "🔙 Return to Menu", callback_data: "/start" }]];

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
