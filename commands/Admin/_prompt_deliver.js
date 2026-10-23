/*CMD
  command: /prompt_deliver
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

var ordId = params ? params.trim() : "";
if (!ordId) {
  Bot.sendMessage("ℹ️ Order ID missing.", { parse_mode: "HTML" });
  return;
}

var text = "✅ <b>Fulfill Custom Order:</b> <code>" + ordId + "</code>\n\n" +
  "To deliver this account, send the command:\n" +
  "<code>/deliver_order " + ordId + " email@gmail.com:password:recovery</code>\n\n" +
  "<i>The user will receive an automated delivery notification with their login credentials!</i>";

var kbd = [
  [{ text: "📦 Return to Orders", callback_data: "/admin_orders" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
