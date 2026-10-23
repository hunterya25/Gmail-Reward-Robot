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

if (User.getProperty("_is_gate_blocked")) {
  return;
}

// 0. Maintenance Mode Check
var adm = Bot.getProperty("adminID");
var isAdm = (adm && user && user.telegramid.toString() === adm.toString());
if (Bot.getProperty("maintenance_mode") && !isAdm) {
  Bot.sendMessage("🚧 <b>System Under Maintenance!</b> 🛠️\n\nOur engineers are upgrading the bot servers. Please check back shortly!", { parse_mode: "HTML" });
  return;
}

if (request && request.id) {
  Api.answerCallbackQuery({ callback_query_id: request.id });
}

// 🗑️ Delete previous bot message for a clean chat
if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
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
    reply_markup: { inline_keyboard: kbd },
    on_result: "/on_save_msg"
  });
  return;
}

var msg = "📜 <b>Your Claimed Gmail Accounts (" + userMails.length + ")</b> 📬\n\n";

for (var i = 0; i < userMails.length && i < 10; i++) {
  var m = userMails[i];
  msg += "<b>#" + (i + 1) + " [" + (m.category || "Gmail") + "]:</b>\n" +
    "📧 <code>" + m.email + "</code>\n" +
    "🔑 <code>" + m.password + "</code>\n";
  if (m.recovery) msg += "🛡️ Recovery: <code>" + m.recovery + "</code>\n";
  if (m.two_factor) msg += "🔐 2FA: <code>" + m.two_factor + "</code>\n";
  if (m.app_password) msg += "⚡ App Pass: <code>" + m.app_password + "</code>\n";
  msg += "📅 <i>Claimed: " + (m.claimed_at || "N/A") + "</i>\n\n";
}

if (userMails.length > 10) {
  msg += "<i>...and " + (userMails.length - 10) + " older accounts.</i>\n\n";
}

var kbd = [[{ text: "🔙 Return to Menu", callback_data: "/balance" }]];

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});
