/*CMD
  command: /promo
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 🎟️ Promo Code, Promo Code, /redeem_promo, 🎁 Promo Code, Promo
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

if (User.getProperty("_is_gate_blocked")) {
  return;
}

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

var codeInput = params ? params.trim().toUpperCase() : "";
if (!codeInput && message && message.indexOf("/promo ") === 0) {
  codeInput = message.replace("/promo ", "").trim().toUpperCase();
}

if (codeInput) {
  Bot.runCommand("/on_redeem_promo " + codeInput);
  return;
}

var promptText = "🎟️ <b>Redeem Promo Code</b> 🎁\n\n" +
  "🌟 <i>Have an official promotional gift code? Enter it below to claim instant bonus Gmail credits!</i>\n\n" +
  "👇 <b>Type or paste your promo code now:</b>";

var kbd = [
  [{ text: "❌ Cancel", callback_data: "/start" }]
];

Bot.run({
  command: "/on_redeem_promo",
  run_after: 0
});

Api.sendMessage({
  chat_id: chatId,
  text: promptText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});
