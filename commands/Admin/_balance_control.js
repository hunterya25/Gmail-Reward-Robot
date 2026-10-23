/*CMD
  command: /add_bal
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /cut_bal, /set_bal
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var cmd = message ? message.split(" ")[0].toLowerCase() : "/add_bal";
var input = params ? params.trim() : "";
if (!input && message) {
  input = message.substring(cmd.length).trim();
}

var parts = input.split(" ");
if (parts.length < 2) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>" + cmd + " &lt;USER_TELEGRAM_ID&gt; &lt;amount&gt;</code>", { parse_mode: "HTML" });
  return;
}

var targetId = parts[0].trim();
var amount = parseFloat(parts[1]);

if (isNaN(amount)) {
  Bot.sendMessage("❌ <b>Invalid amount.</b> Please enter a valid number.", { parse_mode: "HTML" });
  return;
}

var curBal = 0;
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    var res = Libs.ResourcesLib.anotherUserRes("balance", targetId);
    if (cmd === "/add_bal") {
      res.add(amount);
    } else if (cmd === "/cut_bal") {
      res.add(-amount);
    } else if (cmd === "/set_bal") {
      res.set(amount);
    }
    curBal = res.value();
  } else {
    var old = parseFloat(Bot.getProperty("balance_" + targetId) || 0);
    if (cmd === "/add_bal") curBal = old + amount;
    else if (cmd === "/cut_bal") curBal = old - amount;
    else if (cmd === "/set_bal") curBal = amount;
    Bot.setProperty("balance_" + targetId, curBal, "integer");
  }
} catch (e) {
  var old = parseFloat(Bot.getProperty("balance_" + targetId) || 0);
  if (cmd === "/add_bal") curBal = old + amount;
  else if (cmd === "/cut_bal") curBal = old - amount;
  else if (cmd === "/set_bal") curBal = amount;
  Bot.setProperty("balance_" + targetId, curBal, "integer");
}

var actionWord = (cmd === "/add_bal") ? "Credited" : (cmd === "/cut_bal" ? "Deducted" : "Set");
var resultText = "✅ <b>Balance Updated Successfully!</b> 💰\n\n" +
  "• Target User: <code>" + targetId + "</code>\n" +
  "• Action: <b>" + actionWord + " " + amount + " Credits</b>\n" +
  "• New Current Balance: <b>" + curBal + " Credits</b>";

var kbd = [
  [{ text: "👥 Users Division", callback_data: "/admin_users" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: resultText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});

// Notify target user
try {
  Api.sendMessage({
    chat_id: targetId,
    text: "🔔 <b>Balance Notification:</b> Your account was " + actionWord.toLowerCase() + " with <b>" + amount + " Credits</b> by Administration.\n\n💰 <i>New Balance: " + curBal + " Credits</i>",
    parse_mode: "HTML"
  });
} catch (e) {}
