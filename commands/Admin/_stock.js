/*CMD
  command: /stock
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
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

if (request && request.id) {
  try {
    Api.answerCallbackQuery({ callback_query_id: request.id });
  } catch (e) {}
}

var catParam = params ? params.trim().toLowerCase() : "";

var stockNorm = Bot.getProperty("Stock_Normal") || Bot.getProperty("GmailStock") || [];
var stockRec = Bot.getProperty("Stock_Recovery") || [];
var stock2FA = Bot.getProperty("Stock_2FA") || [];
var totalStock = stockNorm.length + stockRec.length + stock2FA.length;

var msg = "📦 <b>Comprehensive Gmail Stock Audit</b> 📊\n\n" +
  "• 🟢 <b>Normal Fresh:</b> <b>" + stockNorm.length + "</b>\n" +
  "• 🛡️ <b>Recovery Attached:</b> <b>" + stockRec.length + "</b>\n" +
  "• 🔐 <b>2-Step Verification (2FA):</b> <b>" + stock2FA.length + "</b>\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "📊 <b>Total Pooled Stock:</b> <b>" + totalStock + " Accounts</b>\n\n";

var inspectArr = [];
var inspectLabel = "";

if (catParam === "recovery") {
  inspectArr = stockRec;
  inspectLabel = "🛡️ Recovery Attached Accounts";
} else if (catParam === "2fa") {
  inspectArr = stock2FA;
  inspectLabel = "🔐 2FA Verified Accounts";
} else {
  inspectArr = stockNorm;
  inspectLabel = "🟢 Normal Fresh Accounts";
}

msg += "<b>Recent in " + inspectLabel + " (" + inspectArr.length + "):</b>\n";

if (inspectArr.length === 0) {
  msg += "<i>No accounts currently loaded in this category.</i>\n";
} else {
  for (var i = 0; i < Math.min(inspectArr.length, 10); i++) {
    var item = inspectArr[i];
    var maskedPass = item.password ? (item.password.substring(0, 2) + "••••" + item.password.slice(-2)) : "••••";
    msg += "<b>#" + (i + 1) + "</b> <code>" + item.email + "</code> | Pass: <code>" + maskedPass + "</code>\n";
  }
  if (inspectArr.length > 10) {
    msg += "\n<i>...and " + (inspectArr.length - 10) + " more in category pool.</i>\n";
  }
}

var kbd = [
  [
    { text: "🟢 Normal (" + stockNorm.length + ")", callback_data: "/stock normal" },
    { text: "🛡️ Recovery (" + stockRec.length + ")", callback_data: "/stock recovery" },
    { text: "🔐 2FA (" + stock2FA.length + ")", callback_data: "/stock 2fa" }
  ],
  [{ text: "🔙 Back to Stock Division", callback_data: "/admin_stock" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
