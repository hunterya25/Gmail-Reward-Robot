/*CMD
  command: /ban
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
  input = message.replace("/ban", "").trim();
}

if (!input) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/ban &lt;USER_TELEGRAM_ID&gt; [reason]</code>\n\n<i>Example:</i> <code>/ban 8669173066 Spamming</code>", { parse_mode: "HTML" });
  return;
}

var parts = input.split(" ");
var targetId = parts[0].trim();
var reason = parts.length > 1 ? parts.slice(1).join(" ").trim() : "Violation of platform terms";

// Save ban flags
Bot.setProperty("ban_" + targetId, true, "boolean");

var bannedList = Bot.getProperty("BannedUsersList") || [];
if (bannedList.indexOf(targetId) === -1) {
  bannedList.push(targetId);
  Bot.setProperty("BannedUsersList", bannedList, "json");
}

var confirmText = "⛔ <b>User Permanently Banned!</b>\n\n" +
  "• Target ID: <code>" + targetId + "</code>\n" +
  "• Reason: <i>" + reason + "</i>\n" +
  "• Status: <b>Blocked from all bot features</b>";

var kbd = [
  [{ text: "🔓 Unban User", callback_data: "/unban " + targetId }],
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
    text: "⛔ <b>Your account has been permanently banned from @GmailRewardRobot.</b>\n\n⚠️ <b>Reason:</b> <i>" + reason + "</i>",
    parse_mode: "HTML"
  });
} catch (e) {}
