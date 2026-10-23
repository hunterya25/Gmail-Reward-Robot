/*CMD
  command: /deliver_order
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

var input = params ? params.trim() : "";
if (!input && message) {
  input = message.replace("/deliver_order", "").trim();
}

var parts = input.split(" ");
if (parts.length < 2) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/deliver_order &lt;ORDER_ID&gt; email:password:recovery</code>", { parse_mode: "HTML" });
  return;
}

var orderId = parts[0].trim();
var creds = parts.slice(1).join(" ").trim();

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

// Update in user history
var userOrders = User.getProperty("MyCustomOrders");
if (userOrders && Array.isArray(userOrders)) {
  for (var j = 0; j < userOrders.length; j++) {
    if (userOrders[j].id === orderId) {
      userOrders[j].status = "Delivered";
      userOrders[j].credentials = creds;
      userOrders[j].delivered_at = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      break;
    }
  }
  User.setProperty("MyCustomOrders", userOrders, "json");
}

// Notify Target User
var userDeliveryMsg = "🎉 <b>Your Custom Gmail Order is Ready!</b> 📬\n\n" +
  "🆔 <b>Order ID:</b> <code>" + orderId + "</code>\n\n" +
  "🔑 <b>Your Account Credentials (tap to copy):</b>\n" +
  "<code>" + creds + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "🛡️ <i>Please log in immediately and update your password and recovery details!</i>\n\n" +
  "Thank you for choosing @GmailRewardRobot!";

try {
  Api.sendMessage({
    chat_id: targetOrder.user_id,
    text: userDeliveryMsg,
    parse_mode: "HTML"
  });
} catch (e) {}

Bot.sendMessage("✅ <b>Order Delivered Successfully!</b> 🚀\n\nOrder <code>" + orderId + "</code> delivered to user <code>" + targetOrder.user_id + "</code>.", { parse_mode: "HTML" });
