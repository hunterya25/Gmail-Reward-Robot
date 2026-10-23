/*CMD
  command: /order_custom
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 🎯 Custom Order, Custom Order
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// 0. Maintenance Mode Check
var adm = Bot.getProperty("adminID");
var isAdm = (adm && user && user.telegramid.toString() === adm.toString());
if (Bot.getProperty("maintenance_mode") && !isAdm) {
  Bot.sendMessage("🚧 <b>System Under Maintenance!</b> 🛠️\n\nOur engineers are upgrading the bot servers. Please check back shortly!", { parse_mode: "HTML" });
  return;
}

// 🗑️ Delete previous bot message
var lastBotMsg = User.getProperty("last_bot_msg_id");
if (lastBotMsg) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: lastBotMsg });
  } catch (e) {}
  User.setProperty("last_bot_msg_id", null);
}

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var currentBalance = 0;
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    currentBalance = Libs.ResourcesLib.userRes("balance").value();
  } else {
    currentBalance = User.getProperty("balance") || 0;
  }
} catch (e) {
  currentBalance = User.getProperty("balance") || 0;
}

var priceCustom = Bot.getProperty("Price_Custom") || 5;

var promptText = "🎯 <b>Custom Gmail Account Order</b> ⚡️\n\n" +
  "🌟 <i>Want a Gmail with a specific username, name, or birth year? Our team will manually create and phone-verify it for you within 1 hour!</i>\n\n" +
  "• 🏷️ <b>Price:</b> <b>" + priceCustom + " Credits</b>\n" +
  "• 💰 <b>Your Balance:</b> <b>" + currentBalance + " Credits</b>\n" +
  "• ⏱️ <b>Delivery Time:</b> <b>Within 1 Hour Guaranteed</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n";

if (currentBalance < priceCustom) {
  promptText += "⚠️ <b>Insufficient Balance!</b> You need at least <b>" + priceCustom + " Credits</b> to order a custom account.\n\n" +
    "👉 <i>Invite friends or earn credits to unlock custom ordering!</i>";

  var kbd = [
    [{ text: "🤝 Invite Friends (+1 Cr)", callback_data: "/refer" }],
    [{ text: "🔙 Back to Store", callback_data: "/getmail" }]
  ];

  Api.sendMessage({
    chat_id: chatId,
    text: promptText,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: kbd },
    on_result: "/on_save_msg"
  });
  return;
}

promptText += "📝 <b>Please reply to this message with your desired details:</b>\n\n" +
  "<i>Example format:</i>\n" +
  "<code>Desired Username: rohit.sharma1998\n" +
  "Full Name: Rohit Sharma\n" +
  "Preferred Password (optional): Pass@2026\n" +
  "Recovery Email (optional): rohit@outlook.com</code>\n\n" +
  "👇 <i>Type your details now:</i>";

var cancelKbd = [
  [{ text: "❌ Cancel Order", callback_data: "/getmail" }]
];

Bot.run({
  command: "/on_order_custom",
  run_after: 0
});

Api.sendMessage({
  chat_id: chatId,
  text: promptText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: cancelKbd },
  on_result: "/on_save_msg"
});
