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
  Api.answerCallbackQuery({ callback_query_id: request.id });
}

var currentStock = Bot.getProperty("GmailStock", []);
if (!currentStock || currentStock.length === 0) {
  Bot.sendMessage("📦 <b>Current Gmail Stock: 0 Accounts</b>\n\nUse <code>/add_gmail email:pass:recovery</code> to load stock.", { parse_mode: "HTML" });
  return;
}

var msg = "📦 <b>Active Gmail Inventory (" + currentStock.length + " Available)</b>\n\n";

for (var i = 0; i < currentStock.length && i < 15; i++) {
  var acc = currentStock[i];
  var maskedPass = acc.password ? (acc.password.substring(0, 2) + "••••" + acc.password.substring(acc.password.length - 2)) : "••••";
  msg += "<b>#" + (i + 1) + "</b> <code>" + acc.email + "</code> | Pass: <code>" + maskedPass + "</code>\n";
}

if (currentStock.length > 15) {
  msg += "\n<i>...and " + (currentStock.length - 15) + " more accounts in pool.</i>";
}

Bot.sendMessage(msg, { parse_mode: "HTML" });
