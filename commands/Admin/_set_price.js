/*CMD
  command: /set_price
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /set_ref_reward, /reset_prices
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var cmd = message ? message.split(" ")[0].toLowerCase() : "/set_price";
var input = params ? params.trim() : "";
if (!input && message) {
  input = message.substring(cmd.length).trim();
}

if (cmd === "/reset_prices") {
  Bot.setProperty("Price_Normal", 1, "integer");
  Bot.setProperty("Price_Recovery", 2, "integer");
  Bot.setProperty("Price_2FA", 3, "integer");
  Bot.setProperty("Price_Custom", 5, "integer");
  Bot.setProperty("Ref_Reward_Amount", 1, "integer");

  Bot.sendMessage("✅ <b>All prices restored to platform defaults:</b>\n\n• Normal: 1 Cr\n• Recovery: 2 Cr\n• 2FA: 3 Cr\n• Custom: 5 Cr\n• Referral Bonus: 1 Cr", { parse_mode: "HTML" });
  return;
}

if (cmd === "/set_ref_reward") {
  var refAmt = parseInt(input);
  if (isNaN(refAmt) || refAmt < 0) {
    Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/set_ref_reward &lt;amount&gt;</code>", { parse_mode: "HTML" });
    return;
  }
  Bot.setProperty("Ref_Reward_Amount", refAmt, "integer");
  Bot.sendMessage("✅ <b>Referral Bonus Updated:</b> Now paying <b>" + refAmt + " Credits</b> per valid verified referral!", { parse_mode: "HTML" });
  return;
}

var parts = input.split(" ");
if (parts.length < 2) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/set_price normal|recovery|2fa|custom &lt;amount&gt;</code>", { parse_mode: "HTML" });
  return;
}

var targetCat = parts[0].toLowerCase();
var newPrice = parseInt(parts[1]);

if (isNaN(newPrice) || newPrice < 0) {
  Bot.sendMessage("❌ <b>Invalid price amount.</b> Please enter a valid number.", { parse_mode: "HTML" });
  return;
}

if (targetCat === "normal") {
  Bot.setProperty("Price_Normal", newPrice, "integer");
} else if (targetCat === "recovery") {
  Bot.setProperty("Price_Recovery", newPrice, "integer");
} else if (targetCat === "2fa") {
  Bot.setProperty("Price_2FA", newPrice, "integer");
} else if (targetCat === "custom") {
  Bot.setProperty("Price_Custom", newPrice, "integer");
} else {
  Bot.sendMessage("❌ Unknown category. Choose from: <code>normal</code>, <code>recovery</code>, <code>2fa</code>, <code>custom</code>", { parse_mode: "HTML" });
  return;
}

var confirmText = "✅ <b>Pricing Updated Successfully!</b> 💰\n\n" +
  "• Category: <b>" + targetCat.toUpperCase() + "</b>\n" +
  "• New Price: <b>" + newPrice + " Credits</b>";

var kbd = [
  [{ text: "💰 View All Prices", callback_data: "/admin_pricing" }],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: confirmText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
