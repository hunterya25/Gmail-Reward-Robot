/*CMD
  command: /admin
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

if (!adm) {
  Bot.setProperty("adminID", user.telegramid, "integer");
  adm = user.telegramid;
  Bot.sendMessage("👑 <b>Admin access configured for ID: " + user.telegramid + "</b>", { parse_mode: "HTML" });
}

if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized: Admin access only!</b>", { parse_mode: "HTML" });
  return;
}

var chatId = (chat && chat.chatid) ? chat.chatid : user.telegramid;

// Delete previous message if callback
if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

// Fetch Quick Stats
var allUsers = Bot.getProperty("all_bot_users") || [];
var totalUsers = allUsers.length;

var stockNorm = (Bot.getProperty("Stock_Normal") || Bot.getProperty("GmailStock") || []).length;
var stockRec = (Bot.getProperty("Stock_Recovery") || []).length;
var stock2FA = (Bot.getProperty("Stock_2FA") || []).length;
var totalStock = stockNorm + stockRec + stock2FA;

var pendingOrders = (Bot.getProperty("PendingCustomOrders") || []).length;
var isMaint = Bot.getProperty("maintenance_mode") ? "🔴 ACTIVE (Locked)" : "🟢 Offline (Normal)";
var curChannel = Bot.getProperty("mandatory_channel", "@BotsByAntares");

var hubText = "👑 <b>@GmailRewardRobot Master Control Center</b> ⚡️\n\n" +
  "📊 <b>Platform Quick Metrics:</b>\n" +
  "• 👥 <b>Total Registered Members:</b> <b>" + totalUsers + "</b>\n" +
  "• 📦 <b>Total Live Gmail Stock:</b> <b>" + totalStock + " Accounts</b> (🟢 " + stockNorm + " | 🛡️ " + stockRec + " | 🔐 " + stock2FA + ")\n" +
  "• 🎯 <b>Pending Custom Orders:</b> <b>" + pendingOrders + "</b>\n" +
  "• 📢 <b>Active Channel Gate:</b> <code>" + curChannel + "</code>\n" +
  "• 🚧 <b>Maintenance Mode:</b> " + isMaint + "\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "👇 <i>Select a specialized management division below:</i>";

var kbd = [
  [
    { text: "👥 Users Management", callback_data: "/admin_users" },
    { text: "📦 Stock & Inventory", callback_data: "/admin_stock" }
  ],
  [
    { text: "🎯 Custom Orders (" + pendingOrders + ")", callback_data: "/admin_orders" },
    { text: "💰 Pricing & Rates", callback_data: "/admin_pricing" }
  ],
  [
    { text: "🤝 Referrals & Anti-Cheat", callback_data: "/admin_refers" },
    { text: "⚙️ Bot & Maintenance", callback_data: "/admin_settings" }
  ],
  [
    { text: "📢 Broadcast Suite", callback_data: "/admin_broadcast" },
    { text: "📊 Platform Analytics", callback_data: "/admin_stats" }
  ],
  [
    { text: "⚠️ Full System Reset", callback_data: "/reset_all" },
    { text: "🔄 Refresh Hub", callback_data: "/admin" }
  ]
];

Api.sendMessage({
  chat_id: chatId,
  text: hubText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
