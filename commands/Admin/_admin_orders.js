/*CMD
  command: /admin_orders
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

var chatId = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var pendingOrders = Bot.getProperty("PendingCustomOrders") || [];

var ordersText = "🎯 <b>Custom Gmail Orders Management Division</b> 📦\n\n" +
  "• ⏳ <b>Pending Orders Requiring Fulfillment:</b> <b>" + pendingOrders.length + "</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n";

var kbd = [];

if (pendingOrders.length === 0) {
  ordersText += "✅ <i>All custom orders have been fulfilled! No pending requests.</i>\n\n";
} else {
  for (var i = 0; i < Math.min(pendingOrders.length, 5); i++) {
    var ord = pendingOrders[i];
    ordersText += "🆔 <b>Order:</b> <code>" + ord.id + "</code>\n" +
      "👤 <b>User:</b> " + ord.user_name + " (<code>" + ord.user_id + "</code>)\n" +
      "💰 <b>Paid:</b> " + ord.price + " Credits | 📅 " + (ord.created_at || "N/A") + "\n" +
      "📋 <b>Requirements:</b>\n" +
      "<blockquote>" + ord.details + "</blockquote>\n" +
      "⚡ <b>Fulfill:</b> <code>/deliver_order " + ord.id + " email:password:recovery</code>\n" +
      "❌ <b>Reject:</b> <code>/reject_order " + ord.id + "</code>\n\n";

    kbd.push([
      { text: "✅ Deliver " + ord.id, callback_data: "/prompt_deliver " + ord.id },
      { text: "❌ Reject & Refund", callback_data: "/reject_order " + ord.id }
    ]);
  }
}

kbd.push([{ text: "🔄 Refresh Orders", callback_data: "/admin_orders" }]);
kbd.push([{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]);

Api.sendMessage({
  chat_id: chatId,
  text: ordersText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
