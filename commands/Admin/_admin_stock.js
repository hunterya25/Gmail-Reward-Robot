/*CMD
  command: /admin_stock
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

var stockNorm = Bot.getProperty("Stock_Normal") || Bot.getProperty("GmailStock") || [];
var stockRec = Bot.getProperty("Stock_Recovery") || [];
var stock2FA = Bot.getProperty("Stock_2FA") || [];
var totalStock = stockNorm.length + stockRec.length + stock2FA.length;

var stockText = "📦 <b>Stock & Inventory Management Division</b> ⚡️\n\n" +
  "• 🟢 <b>Normal Fresh Gmails:</b> <b>" + stockNorm.length + " Accounts</b>\n" +
  "• 🛡️ <b>Recovery Attached Gmails:</b> <b>" + stockRec.length + " Accounts</b>\n" +
  "• 🔐 <b>2-Step Verification (2FA) Gmails:</b> <b>" + stock2FA.length + " Accounts</b>\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "📊 <b>Total Inventory:</b> <b>" + totalStock + " Accounts</b>\n\n" +
  "⚡️ <b>Quick Commands Available:</b>\n" +
  "• <code>/add_normal email:pass</code> (or multiple lines)\n" +
  "• <code>/add_recovery email:pass:recovery</code> (or multiple lines)\n" +
  "• <code>/add_2fa email:pass:2fakey</code> (or multiple lines)\n" +
  "• <code>/stock &lt;category&gt;</code> — Inspect detailed accounts\n" +
  "• <code>/wipe_stock &lt;category&gt;</code> — Clear inventory for a category\n\n" +
  "👇 <i>Or tap an action below to upload stock:</i>";

var kbd = [
  [
    { text: "🟢 Add Normal Gmails", callback_data: "/prompt_add_normal" },
    { text: "🛡️ Add Recovery Gmails", callback_data: "/prompt_add_recovery" }
  ],
  [
    { text: "🔐 Add 2FA Gmails", callback_data: "/prompt_add_2fa" },
    { text: "📦 Inspect Inventory (" + totalStock + ")", callback_data: "/stock" }
  ],
  [
    { text: "🧹 Wipe Empty / Stale Stock", callback_data: "/prompt_wipe_stock" }
  ],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: stockText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
