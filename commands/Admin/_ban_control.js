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
  aliases: /unban, /view_banned
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var cmd = message ? message.split(" ")[0].toLowerCase() : "/ban";
var targetId = params ? params.trim() : "";
if (!targetId && message) {
  targetId = message.replace(cmd, "").trim();
}

var bannedList = Bot.getProperty("BannedUsersList") || [];

if (cmd === "/view_banned") {
  var bText = "⛔ <b>Banned Users Directory</b> (" + bannedList.length + ")\n\n";
  if (bannedList.length === 0) {
    bText += "<i>No users are currently banned.</i>\n";
  } else {
    for (var i = 0; i < bannedList.length; i++) {
      bText += (i + 1) + ". <code>" + bannedList[i] + "</code>\n";
    }
  }

  var kbd = [
    [{ text: "👥 Users Division", callback_data: "/admin_users" }],
    [{ text: "👑 Admin Hub", callback_data: "/admin" }]
  ];

  Api.sendMessage({
    chat_id: chat ? chat.chatid : user.telegramid,
    text: bText,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: kbd }
  });
  return;
}

if (!targetId) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>" + cmd + " &lt;USER_TELEGRAM_ID&gt;</code>", { parse_mode: "HTML" });
  return;
}

if (cmd === "/ban") {
  Bot.setProperty("ban_" + targetId, true, "boolean");
  if (bannedList.indexOf(targetId) === -1) {
    bannedList.push(targetId);
    Bot.setProperty("BannedUsersList", bannedList, "json");
  }

  Bot.sendMessage("⛔ <b>User Banned!</b> ID <code>" + targetId + "</code> has been restricted from using the bot.", { parse_mode: "HTML" });

  try {
    Api.sendMessage({
      chat_id: targetId,
      text: "⛔ <b>Your account has been permanently banned from @GmailRewardRobot due to security/policy violations.</b>",
      parse_mode: "HTML"
    });
  } catch (e) {}

} else if (cmd === "/unban") {
  Bot.setProperty("ban_" + targetId, null);
  var idx = bannedList.indexOf(targetId);
  if (idx !== -1) {
    bannedList.splice(idx, 1);
    Bot.setProperty("BannedUsersList", bannedList, "json");
  }

  Bot.sendMessage("✅ <b>User Unbanned!</b> ID <code>" + targetId + "</code> has been restored to normal access.", { parse_mode: "HTML" });

  try {
    Api.sendMessage({
      chat_id: targetId,
      text: "✅ <b>Your account has been unbanned by administration. You can now use the bot normally!</b>",
      parse_mode: "HTML"
    });
  } catch (e) {}
}
