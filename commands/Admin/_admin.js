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
  // First time setup: allow current user to claim admin
  Bot.setProperty("adminID", user.telegramid, "integer");
  Bot.sendMessage("👑 <b>Admin access configured for user ID: " + user.telegramid + "</b>", { parse_mode: "HTML" });
  adm = user.telegramid;
}

if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized: Admin access only!</b>", { parse_mode: "HTML" });
  return;
}

var allUsers = Bot.getProperty("all_bot_users", []);
var totalUsersCount = allUsers ? allUsers.length : 0;

var gmailStock = Bot.getProperty("GmailStock", []);
var stockCount = gmailStock ? gmailStock.length : 0;

var currentWebapp = Bot.getProperty("mini_app_url", "https://antares-bots.github.io/gmail-reward-verifier");

var adminPanelText = "👑 <b>GmailRewardBot Admin Dashboard</b> 🛠️\n\n" +
  "📊 <b>Bot Metrics:</b>\n" +
  "• 👥 <b>Total Registered Users:</b> <b>" + totalUsersCount + "</b>\n" +
  "• 📦 <b>Gmail Stock Remaining:</b> <b>" + stockCount + " Accounts</b>\n" +
  "• 🌐 <b>Mini App Verifier URL:</b>\n<code>" + currentWebapp + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⚡️ <b>Admin Commands:</b>\n" +
  "• ➕ <code>/add_gmail email:password:recovery</code> — Add accounts to stock (or multiple lines)\n" +
  "• 🌐 <code>/set_webapp https://...</code> — Update the Verification Mini App URL\n" +
  "• 📦 <code>/stock</code> — View remaining inventory details\n" +
  "• 🔄 <code>/clear_device DEV_ID</code> — Unbind a device for testing\n" +
  "• ⚠️ <code>/reset_all</code> — Wipe all devices, IPs & user data to test from scratch\n" +
  "• 📢 <code>/broadcast &lt;message&gt;</code> — Send message to all users";

var kbd = [
  [{ text: "➕ Add Gmails to Stock", callback_data: "/add_gmail_prompt" }],
  [{ text: "📦 Inspect Stock (" + stockCount + ")", callback_data: "/stock" }],
  [{ text: "⚠️ Reset All Bot Data", callback_data: "/reset_all" }]
];

Api.sendMessage({
  text: adminPanelText,
  parse_mode: "HTML",
  disable_web_page_preview: true,
  reply_markup: { inline_keyboard: kbd }
});
