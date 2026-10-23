/*CMD
  command: /stock_status
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 📦 Live Stock, Live Stock, /stock_user
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// Maintenance Mode Check
var adm = Bot.getProperty("adminID");
var isAdm = (adm && user && user.telegramid.toString() === adm.toString());
if (Bot.getProperty("maintenance_mode") && !isAdm) {
  Bot.sendMessage("🚧 <b>System Under Maintenance!</b> 🛠️\n\nOur engineers are upgrading the bot servers. Please check back shortly!", { parse_mode: "HTML" });
  return;
}

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var stockNormalArr = Bot.getProperty("Stock_Normal") || Bot.getProperty("GmailStock") || [];
var stockRecoveryArr = Bot.getProperty("Stock_Recovery") || [];
var stock2FAArr = Bot.getProperty("Stock_2FA") || [];

var stateNorm = Bot.getProperty("CategoryState_normal") || "ON";
var stateRec = Bot.getProperty("CategoryState_recovery") || "ON";
var state2FA = Bot.getProperty("CategoryState_2fa") || "ON";

var pNormal = Bot.getProperty("Price_Normal") || 1;
var pRecovery = Bot.getProperty("Price_Recovery") || 2;
var p2FA = Bot.getProperty("Price_2FA") || 3;
var pCustom = Bot.getProperty("Price_Custom") || 5;

var total = 0;
var stockMsg = "📦 <b>Real-Time Live Gmail Inventory</b> 📊\n\n" +
  "🌟 <i>Live inventory status updated automatically across all active categories:</i>\n\n";

if (stateNorm !== "PRIVATE") {
  if (stateNorm === "ON") {
    total += stockNormalArr.length;
    stockMsg += "🟢 <b>Normal Fresh Gmails:</b>\n" +
      "• Available: <b>" + stockNormalArr.length + " Accounts</b>\n" +
      "• Rate: <code>" + pNormal + " Credit</code>\n\n";
  } else {
    stockMsg += "🟢 <b>Normal Fresh Gmails:</b>\n" +
      "• Status: <i>⚠️ Temporarily Disabled</i>\n\n";
  }
}

if (stateRec !== "PRIVATE") {
  if (stateRec === "ON") {
    total += stockRecoveryArr.length;
    stockMsg += "🛡️ <b>Recovery Attached Gmails:</b>\n" +
      "• Available: <b>" + stockRecoveryArr.length + " Accounts</b>\n" +
      "• Rate: <code>" + pRecovery + " Credits</code>\n\n";
  } else {
    stockMsg += "🛡️ <b>Recovery Attached Gmails:</b>\n" +
      "• Status: <i>⚠️ Temporarily Disabled</i>\n\n";
  }
}

if (state2FA !== "PRIVATE") {
  if (state2FA === "ON") {
    total += stock2FAArr.length;
    stockMsg += "🔐 <b>2-Step Verification (2FA) Gmails:</b>\n" +
      "• Available: <b>" + stock2FAArr.length + " Accounts</b>\n" +
      "• Rate: <code>" + p2FA + " Credits</code>\n\n";
  } else {
    stockMsg += "🔐 <b>2-Step Verification (2FA) Gmails:</b>\n" +
      "• Status: <i>⚠️ Temporarily Disabled</i>\n\n";
  }
}

stockMsg += "🎯 <b>Custom Gmail Orders:</b>\n" +
  "• Status: <b>🟢 Open (1-Hour Delivery)</b>\n" +
  "• Rate: <code>" + pCustom + " Credits</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "📊 <b>Total Pooled Stock Available:</b> <b>" + total + " Accounts</b>\n\n" +
  "👇 <i>Claim an account now or invite friends to earn credits:</i>";

var kbd = [
  [{ text: "⚡ Claim a Gmail Now", callback_data: "/getmail" }],
  [
    { text: "🤝 Refer Friends (+1 Cr)", callback_data: "/refer" },
    { text: "🏠 Main Menu", callback_data: "/start" }
  ]
];

Api.sendMessage({
  chat_id: chatId,
  text: stockMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});
