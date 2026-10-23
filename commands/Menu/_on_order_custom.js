/*CMD
  command: /on_order_custom
  help: 
  need_reply: true
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

if (!message || message.indexOf("/") === 0) {
  // If user tapped a slash command instead, let the bot handle it
  return;
}

var currentBalance = 0;
var balanceRes = null;
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    balanceRes = Libs.ResourcesLib.userRes("balance");
    currentBalance = balanceRes ? balanceRes.value() : 0;
  } else {
    currentBalance = User.getProperty("balance") || 0;
  }
} catch (e) {
  currentBalance = User.getProperty("balance") || 0;
}

var priceCustom = Bot.getProperty("Price_Custom") || 5;

if (currentBalance < priceCustom) {
  Bot.sendMessage("⚠️ <b>Insufficient Credits:</b> You need " + priceCustom + " Credits to place this order.", { parse_mode: "HTML" });
  return;
}

// Generate unique Order ID
var orderId = "ORD_" + Math.floor(100000 + Math.random() * 900000);
var nowTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

var orderData = {
  id: orderId,
  user_id: user.telegramid,
  user_name: user.first_name || "User",
  username: user.username || "",
  details: message.trim(),
  price: priceCustom,
  status: "Pending",
  created_at: nowTime
};

// Deduct balance
if (balanceRes && balanceRes.add) {
  balanceRes.add(-priceCustom);
} else {
  User.setProperty("balance", currentBalance - priceCustom, "integer");
}

// Save order to pending list in Bot
var pendingOrders = Bot.getProperty("PendingCustomOrders");
if (!pendingOrders || !Array.isArray(pendingOrders)) { pendingOrders = []; }
pendingOrders.unshift(orderData);
Bot.setProperty("PendingCustomOrders", pendingOrders, "json");

// Save order to user's order list
var userOrders = User.getProperty("MyCustomOrders");
if (!userOrders || !Array.isArray(userOrders)) { userOrders = []; }
userOrders.unshift(orderData);
User.setProperty("MyCustomOrders", userOrders, "json");

var userSuccessMsg = "✅ <b>Custom Gmail Order Placed Successfully!</b> 🎯\n\n" +
  "🆔 <b>Order ID:</b> <code>" + orderId + "</code>\n" +
  "🏷️ <b>Price Deducted:</b> <b>" + priceCustom + " Credits</b>\n" +
  "⏱️ <b>Estimated Delivery:</b> <b>Within 1 Hour</b>\n\n" +
  "📋 <b>Your Submitted Requirements:</b>\n" +
  "<blockquote>" + message.trim() + "</blockquote>\n\n" +
  "<i>You will receive an automated notification as soon as our team delivers your account!</i>";

var kbd = [
  [{ text: "🎯 Track My Orders", callback_data: "/my_orders" }],
  [{ text: "🏠 Main Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: userSuccessMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});

// Notify Admin
var adm = Bot.getProperty("adminID");
if (adm) {
  var adminAlert = "🚨 <b>NEW CUSTOM GMAIL ORDER!</b> 🎯\n\n" +
    "🆔 <b>Order ID:</b> <code>" + orderId + "</code>\n" +
    "👤 <b>User:</b> " + (user.first_name || "User") + " (@" + (user.username || user.telegramid) + ")\n" +
    "🆔 <b>User ID:</b> <code>" + user.telegramid + "</code>\n" +
    "💰 <b>Credits Paid:</b> " + priceCustom + "\n\n" +
    "📝 <b>Requested Details:</b>\n" +
    "<blockquote>" + message.trim() + "</blockquote>\n\n" +
    "⚡ <b>To deliver:</b>\n" +
    "<code>/deliver_order " + orderId + " email:password:recovery</code>\n\n" +
    "❌ <b>To reject & refund:</b>\n" +
    "<code>/reject_order " + orderId + "</code>";

  var adminKbd = [
    [{ text: "📦 Manage Orders", callback_data: "/admin_orders" }]
  ];

  Api.sendMessage({
    chat_id: adm,
    text: adminAlert,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: adminKbd }
  });
}
