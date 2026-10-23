/*CMD
  command: /suspended_users
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /view_suspended
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized: Admin access only!</b>", { parse_mode: "HTML" });
  return;
}

var chatId = chat ? chat.chatid : user.telegramid;

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var suspList = Bot.getProperty("SuspendedUsersList") || [];
var now = Date.now();
var activeList = [];

for (var i = 0; i < suspList.length; i++) {
  var uid = suspList[i];
  var rawUntil = Bot.getProperty("SuspendedUntil_" + uid);
  var untilMs = rawUntil ? parseInt(rawUntil) : 0;
  var data = Bot.getProperty("SuspendedUser_" + uid);
  if (typeof data === "string" && data !== "null" && data !== "undefined" && data !== "false") {
    try { data = JSON.parse(data); } catch (e) { data = null; }
  }
  if (!untilMs && data && data.suspended_until) {
    untilMs = parseInt(data.suspended_until) || 0;
  }

  if (untilMs && !isNaN(untilMs)) {
    if (now >= untilMs) {
      // Auto-expired: clear
      Bot.setProperty("SuspendedUntil_" + uid, 0, "integer");
      Bot.setProperty("SuspendedUser_" + uid, null);
    } else {
      if (!data) {
        data = { user_id: uid, reason: "Restricted", duration: "Active", unban_at_ist: "" };
      }
      data.user_id = uid;
      data.suspended_until = untilMs;
      activeList.push(data);
    }
  } else {
    // Expired or cleared: prune
    Bot.setProperty("SuspendedUntil_" + uid, 0, "integer");
    Bot.setProperty("SuspendedUser_" + uid, null);
  }
}

// Update cleaned list
var cleanedIds = [];
for (var k = 0; k < activeList.length; k++) {
  cleanedIds.push(activeList[k].user_id);
}
Bot.setProperty("SuspendedUsersList", cleanedIds, "json");

var listText = "⏳ <b>Currently Suspended Accounts Directory</b> (" + activeList.length + ")\n\n";

if (activeList.length === 0) {
  listText += "<i>No users are currently suspended.</i>\n\n";
} else {
  for (var j = 0; j < activeList.length; j++) {
    var item = activeList[j];
    var remMs = item.suspended_until - now;
    var remMins = Math.ceil(remMs / (60 * 1000));
    var remDisplay = remMins + " Minutes";
    if (remMins >= 60) {
      var rH = Math.floor(remMins / 60);
      var rM = remMins % 60;
      remDisplay = rH + "h " + rM + "m";
    }

    listText += "<b>#" + (j + 1) + " User:</b> <code>" + item.user_id + "</code>\n" +
      "⚠️ <b>Reason:</b> <i>" + item.reason + "</i>\n" +
      "⏱️ <b>Duration:</b> " + item.duration + " (Rem: <b>" + remDisplay + "</b>)\n" +
      "📅 <b>Lifts At (IST):</b> <code>" + item.unban_at_ist + "</code>\n" +
      "⚡ <b>Action:</b> <code>/unsuspend " + item.user_id + "</code>\n\n";
  }
}

var kbd = [
  [{ text: "👥 Users Division", callback_data: "/admin_users" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: listText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
