/*CMD
  command: /my_referrals
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

var refList = Bot.getProperty("UserReferrals_" + user.telegramid);

if (!refList || !Array.isArray(refList) || refList.length === 0) {
  var emptyMsg = "👥 <b>No Referrals Yet!</b>\n\n" +
    "You have not invited any friends yet.\n" +
    "Share your link and earn <b>1 Gmail Credit</b> for every unique device that verifies!";

  var kbd = [[{ text: "🤝 Get My Referral Link", callback_data: "/refer" }]];
  Api.sendMessage({
    chat_id: chatId,
    text: emptyMsg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: kbd }
  });
  return;
}

var msg = "👥 <b>Your Referral History (" + refList.length + " Total)</b> 📊\n\n";

for (var i = 0; i < refList.length && i < 12; i++) {
  var r = refList[i];
  var statusBadge = (r.status === "Verified") ? "✅ Verified" : "⚠️ " + (r.status || "Pending");
  var userHandle = r.username ? ("@" + r.username) : (r.name || ("ID: " + r.id));

  msg += "<b>#" + (i + 1) + " " + userHandle + "</b>\n" +
    "🛡️ <i>Device: " + statusBadge + "</i> | 📅 <i>" + (r.time || "Recent") + "</i>\n\n";
}

if (refList.length > 12) {
  msg += "<i>...and " + (refList.length - 12) + " more referrals.</i>\n\n";
}

msg += "💡 <i>Only verified unique devices credit your balance.</i>";

var kbd = [
  [{ text: "🚀 Invite More Friends", callback_data: "/refer" }],
  [{ text: "🔙 Return to Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
