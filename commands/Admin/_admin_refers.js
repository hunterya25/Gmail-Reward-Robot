/*CMD
  command: /admin_refers
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

var allDevs = (Bot.getProperty("RegisteredDeviceKeys") || []).length;
var allIps = (Bot.getProperty("RegisteredIpKeys") || []).length;

var refersText = "🤝 <b>Referrals & Anti-Cheat Division</b> 🛡️\n\n" +
  "• 📱 <b>Registered Hardware Devices:</b> <b>" + allDevs + "</b>\n" +
  "• 🌐 <b>Registered IP Networks:</b> <b>" + allIps + "</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⚡️ <b>Quick Commands Available:</b>\n" +
  "• <code>/top_referrers</code> — View leaderboard of top referrers\n" +
  "• <code>/inspect_refs &lt;user_id&gt;</code> — View all people invited by a user\n" +
  "• <code>/clear_device &lt;DEV_ID/USER_ID&gt;</code> — Unbind device & reset user\n\n" +
  "👇 <i>Or tap an action below:</i>";

var kbd = [
  [
    { text: "🏆 Top Referrers Leaderboard", callback_data: "/top_referrers" },
    { text: "🔍 Inspect User Referrals", callback_data: "/prompt_inspect_refs" }
  ],
  [
    { text: "📱 Unbind Device / User", callback_data: "/prompt_clear_dev" },
    { text: "⚠️ System Reset", callback_data: "/reset_all" }
  ],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: refersText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
