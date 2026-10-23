/*CMD
  command: /admin_broadcast
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

var broadText = "📢 <b>Broadcasting & Announcements Suite</b> ⚡️\n\n" +
  "• 👥 <b>Potential Total Audience:</b> <b>" + allUsers.length + " Registered Users</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⚡️ <b>Quick Commands Available:</b>\n" +
  "• <code>/broadcast &lt;message&gt;</code> — Send global message to all users\n" +
  "• <code>/broadcast_pin &lt;message&gt;</code> — Send message and pin it in chats\n\n" +
  "👇 <i>Or tap an option below:</i>";

var kbd = [
  [{ text: "📢 Send Normal Broadcast", callback_data: "/prompt_broadcast" }],
  [{ text: "📌 Send Pinned Announcement", callback_data: "/prompt_broadcast_pin" }],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: broadText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
