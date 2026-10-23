/*CMD
  command: /admin_stats
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

var allUsers = Bot.getProperty("all_bot_users") || [];
var devCount = (Bot.getProperty("RegisteredDeviceKeys") || []).length;
var ipCount = (Bot.getProperty("RegisteredIpKeys") || []).length;
var stockNorm = (Bot.getProperty("Stock_Normal") || Bot.getProperty("GmailStock") || []).length;
var stockRec = (Bot.getProperty("Stock_Recovery") || []).length;
var stock2FA = (Bot.getProperty("Stock_2FA") || []).length;
var totalStock = stockNorm + stockRec + stock2FA;
var totalClaimed = Bot.getProperty("TotalGmailsClaimedGlobal") || 0;
var pendingOrders = (Bot.getProperty("PendingCustomOrders") || []).length;

var statsText = "📊 <b>Platform Deep Analytics & Metrics</b> 📈\n\n" +
  "👥 <b>User Base:</b>\n" +
  "• Total Users: <b>" + allUsers.length + "</b>\n" +
  "• Verified Unique Hardware Devices: <b>" + devCount + "</b>\n" +
  "• Registered Network Subnets: <b>" + ipCount + "</b>\n\n" +
  "📦 <b>Inventory & Dispenser:</b>\n" +
  "• Normal Gmails In Stock: <b>" + stockNorm + "</b>\n" +
  "• Recovery Gmails In Stock: <b>" + stockRec + "</b>\n" +
  "• 2FA Gmails In Stock: <b>" + stock2FA + "</b>\n" +
  "• Total Accounts Dispensed: <b>" + totalClaimed + "</b>\n\n" +
  "🎯 <b>Custom Fulfillment:</b>\n" +
  "• Pending Custom Orders: <b>" + pendingOrders + "</b>\n\n" +
  "🛡️ <b>Anti-Cheat Engine:</b>\n" +
  "• Silicon Invariant Fingerprinting: <b>ACTIVE ✅</b>\n" +
  "• Subnet /24 Clustering: <b>ACTIVE ✅</b>\n" +
  "• Dual-Layer Network Validation: <b>ACTIVE ✅</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━";

var kbd = [
  [{ text: "🔄 Refresh Analytics", callback_data: "/admin_stats" }],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: statsText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
