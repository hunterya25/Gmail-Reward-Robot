/*CMD
  command: /my_orders
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

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var orders = User.getProperty("MyCustomOrders");

if (!orders || !Array.isArray(orders) || orders.length === 0) {
  var emptyText = "🎯 <b>Your Custom Gmail Orders</b>\n\n" +
    "You have not placed any custom Gmail orders yet.\n\n" +
    "<i>Custom orders allow you to get Gmail accounts with custom usernames delivered within 1 hour!</i>";

  var kbd = [
    [{ text: "🎯 Place a Custom Order", callback_data: "/order_custom" }],
    [{ text: "🔙 Main Menu", callback_data: "/start" }]
  ];

  Api.sendMessage({
    chat_id: chatId,
    text: emptyText,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: kbd },
    on_result: "/on_save_msg"
  });
  return;
}

var text = "🎯 <b>Your Custom Gmail Orders History</b> (" + orders.length + ")\n\n";

for (var i = 0; i < Math.min(orders.length, 10); i++) {
  var o = orders[i];
  var statusBadge = (o.status === "Delivered") ? "✅ Delivered" : (o.status === "Rejected" ? "❌ Refunded" : "⏳ Pending");
  text += "━━━━━━━━━━━━━━━━━━━━\n" +
    "🆔 <b>Order:</b> <code>" + o.id + "</code> | " + statusBadge + "\n" +
    "📅 <b>Date:</b> " + (o.created_at || "N/A") + "\n" +
    "📋 <b>Details:</b> <i>" + o.details.substring(0, 45) + "...</i>\n";

  if (o.status === "Delivered" && o.credentials) {
    text += "📬 <b>Credentials:</b>\n<code>" + o.credentials + "</code>\n";
  }
  text += "\n";
}

var backKbd = [
  [{ text: "🎯 Order Another", callback_data: "/order_custom" }],
  [{ text: "🏠 Main Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: text,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: backKbd },
  on_result: "/on_save_msg"
});
