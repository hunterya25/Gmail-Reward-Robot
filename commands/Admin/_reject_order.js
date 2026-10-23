/*CMD
  command: /reject_order
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

var orderId = params ? params.trim() : "";
if (!orderId && message) {
  orderId = message.replace("/reject_order", "").trim();
}

if (!orderId) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/reject_order &lt;ORDER_ID&gt;</code>", { parse_mode: "HTML" });
  return;
}

var pendingOrders = Bot.getProperty("PendingCustomOrders") || [];
var foundIndex = -1;
var targetOrder = null;

for (var i = 0; i < pendingOrders.length; i++) {
  if (pendingOrders[i].id === orderId) {
    foundIndex = i;
    targetOrder = pendingOrders[i];
    break;
  }
}

if (!targetOrder) {
  Bot.sendMessage("❌ <b>Order ID not found</b> in pending list: <code>" + orderId + "</code>", { parse_mode: "HTML" });
  return;
}

// Remove from pending
pendingOrders.splice(foundIndex, 1);
Bot.setProperty("PendingCustomOrders", pendingOrders, "json");

// Refund user credits safely
var refundAmount = targetOrder.price || 5;
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    Libs.ResourcesLib.anotherUserRes("balance", targetOrder.user_id).add(refundAmount);
  } else {
    var oldBal = Bot.getProperty("balance_" + targetOrder.user_id) || 0;
    Bot.setProperty("balance_" + targetOrder.user_id, parseInt(oldBal) + refundAmount, "integer");
  }
} catch (e) {
  var oldBal = Bot.getProperty("balance_" + targetOrder.user_id) || 0;
  Bot.setProperty("balance_" + targetOrder.user_id, parseInt(oldBal) + refundAmount, "integer");
}

// Notify Target User
var userRefundNotice = "❌ <b>Order Notice: Custom Order Cancelled & Refunded</b>\n\n" +
  "🆔 <b>Order ID:</b> <code>" + orderId + "</code>\n" +
  "💰 <b>Refund Amount:</b> <b>+" + refundAmount + " Credits</b> added back to your balance.\n\n" +
  "<i>We were unable to fulfill your specific username request at this time. You may place a new order or explore our instant stock!</i>";

try {
  Api.sendMessage({
    chat_id: targetOrder.user_id,
    text: userRefundNotice,
    parse_mode: "HTML"
  });
} catch (e) {}

Bot.sendMessage("✅ <b>Order Cancelled & Refunded!</b> 🔄\n\nOrder <code>" + orderId + "</code> was removed and <b>" + refundAmount + " Credits</b> were refunded to user <code>" + targetOrder.user_id + "</code>.", { parse_mode: "HTML" });
