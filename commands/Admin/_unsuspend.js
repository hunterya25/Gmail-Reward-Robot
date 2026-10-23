/*CMD
  command: /unsuspend
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
  input = message.replace("/unsuspend", "").trim();
}

if (!input) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/unsuspend &lt;USER_TELEGRAM_ID&gt;</code>\n\n<i>Example:</i> <code>/unsuspend 8669173066</code>", { parse_mode: "HTML" });
  return;
}

var targetId = input.split(" ")[0].trim();

// 1. Reset suspension timestamp to 0
Bot.setProperty("SuspendedUntil_" + targetId, 0, "integer");

// 2. Remove suspension property
Bot.setProperty("SuspendedUser_" + targetId, null);

// 2. Remove from SuspendedUsersList
var suspList = Bot.getProperty("SuspendedUsersList") || [];
var newSusp = [];
for (var i = 0; i < suspList.length; i++) {
  if (suspList[i] && suspList[i].toString() !== targetId.toString()) {
    newSusp.push(suspList[i].toString());
  }
}
Bot.setProperty("SuspendedUsersList", newSusp, "json");

var confirmText = "✅ <b>User Suspension Lifted!</b> 🔓\n\n" +
  "• Target ID: <code>" + targetId + "</code>\n" +
  "• Status: <b>Restored to full account privileges</b>\n" +
  "• Remaining Suspended Users: <b>" + newSusp.length + "</b>";

var kbd = [
  [{ text: "📋 View Suspended Directory", callback_data: "/suspended_users" }],
  [{ text: "👥 Users Division", callback_data: "/admin_users" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: confirmText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});

// Notify Target User
try {
  Api.sendMessage({
    chat_id: targetId,
    text: "🎉 <b>Aapka account suspension administration dwara lift kar diya gaya hai!</b>\n\n<i>Ab aap @GmailRewardRobot normal tarike se use kar sakte hai. /start bhej kar shuru kare!</i>",
    parse_mode: "HTML"
  });
} catch (e) {}
