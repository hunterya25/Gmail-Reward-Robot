/*CMD
  command: /unban
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
  Bot.sendMessage("⛔️ <b>Unauthorized: Admin access only!</b>", { parse_mode: "HTML" });
  return;
}

var input = params ? params.trim() : "";
if (!input && message) {
  input = message.replace("/unban", "").trim();
}

if (!input) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/unban &lt;USER_TELEGRAM_ID&gt;</code>\n\n<i>Example:</i> <code>/unban 8669173066</code>", { parse_mode: "HTML" });
  return;
}

var targetId = input.split(" ")[0].trim();

// 1. Explicitly clear ban flag to false (boolean)
Bot.setProperty("ban_" + targetId, false, "boolean");

// 2. Remove from BannedUsersList (both string and int forms)
var bannedList = Bot.getProperty("BannedUsersList") || [];
var newBanned = [];
for (var i = 0; i < bannedList.length; i++) {
  if (bannedList[i] && bannedList[i].toString() !== targetId.toString()) {
    newBanned.push(bannedList[i].toString());
  }
}
Bot.setProperty("BannedUsersList", newBanned, "json");

var confirmText = "✅ <b>User Unbanned Successfully!</b> 🔓\n\n" +
  "• Target ID: <code>" + targetId + "</code>\n" +
  "• Access: <b>Restored to Normal</b>\n" +
  "• Remaining Banned Users: <b>" + newBanned.length + "</b>";

var kbd = [
  [{ text: "🚫 View Banned Directory", callback_data: "/view_banned" }],
  [{ text: "👥 Users Division", callback_data: "/admin_users" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: confirmText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});

// Notify target user
try {
  Api.sendMessage({
    chat_id: targetId,
    text: "🎉 <b>Good news! Your account ban has been lifted by Administration.</b>\n\n<i>You can now access @GmailRewardRobot and claim rewards normally. Send /start to begin!</i>",
    parse_mode: "HTML"
  });
} catch (e) {}
