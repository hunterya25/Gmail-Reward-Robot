/*CMD
  command: /admin_users
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
var bannedList = Bot.getProperty("BannedUsersList") || [];
var suspList = Bot.getProperty("SuspendedUsersList") || [];

var usersText = "👥 <b>Users Management Division</b> 🛠️\n\n" +
  "• 👥 <b>Total Registered Users:</b> <b>" + allUsers.length + "</b>\n" +
  "• ⛔ <b>Banned Accounts:</b> <b>" + bannedList.length + "</b>\n" +
  "• ⏳ <b>Suspended Accounts:</b> <b>" + suspList.length + "</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⚡️ <b>Quick Commands Available:</b>\n" +
  "• <code>/user_info &lt;ID&gt;</code> — View user balance, device & IP history\n" +
  "• <code>/add_bal &lt;ID&gt; &lt;amount&gt;</code> — Credit user balance\n" +
  "• <code>/cut_bal &lt;ID&gt; &lt;amount&gt;</code> — Deduct user balance\n" +
  "• <code>/ban &lt;ID&gt; [reason]</code> — Permanently ban user\n" +
  "• <code>/unban &lt;ID&gt;</code> — Unban user\n" +
  "• <code>/suspend &lt;ID&gt; &lt;time&gt; &lt;reason&gt;</code> — Suspend user (e.g. <code>2h</code>, <code>30m</code>, <code>1h30m</code>)\n" +
  "• <code>/unsuspend &lt;ID&gt;</code> — Lift suspension immediately\n" +
  "• <code>/clear_device &lt;ID/DEV_ID&gt;</code> — Reset device & force reverification\n\n" +
  "👇 <i>Or tap an action below:</i>";

var kbd = [
  [
    { text: "🔍 Search User Profile", callback_data: "/prompt_user_info" },
    { text: "📱 Clear Device Binding", callback_data: "/prompt_clear_dev" }
  ],
  [
    { text: "➕ Add Credits", callback_data: "/prompt_add_bal" },
    { text: "➖ Deduct Credits", callback_data: "/prompt_cut_bal" }
  ],
  [
    { text: "⛔ Ban / Unban User", callback_data: "/prompt_ban" },
    { text: "🚫 Banned Users (" + bannedList.length + ")", callback_data: "/view_banned" }
  ],
  [
    { text: "⏳ Suspend User", callback_data: "/prompt_suspend" },
    { text: "🔓 Unsuspend User", callback_data: "/prompt_unsuspend" }
  ],
  [
    { text: "📋 Suspended Users (" + suspList.length + ")", callback_data: "/suspended_users" }
  ],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: usersText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
