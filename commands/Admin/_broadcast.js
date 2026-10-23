/*CMD
  command: /broadcast
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /broadcast_pin
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var cmd = message ? message.split(" ")[0].toLowerCase() : "/broadcast";
var textToBroadcast = params ? params.trim() : "";
if (!textToBroadcast && message) {
  textToBroadcast = message.replace(cmd, "").trim();
}

if (!textToBroadcast) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>" + cmd + " &lt;Your Announcement Text&gt;</code>", { parse_mode: "HTML" });
  return;
}

var shouldPin = (cmd === "/broadcast_pin");
var allUsers = Bot.getProperty("all_bot_users") || [];

if (allUsers.length === 0) {
  Bot.sendMessage("⚠️ <b>No users found in database to broadcast to.</b>", { parse_mode: "HTML" });
  return;
}

var sentCount = 0;
var failedCount = 0;

var formattedMsg = "📢 <b>Official Announcement from @GmailRewardRobot</b> 🔔\n\n" +
  textToBroadcast + "\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "<i>Sent by Administration</i>";

for (var i = 0; i < allUsers.length; i++) {
  var targetId = allUsers[i];
  try {
    Api.sendMessage({
      chat_id: targetId,
      text: formattedMsg,
      parse_mode: "HTML",
      disable_web_page_preview: true
    });
    sentCount++;
  } catch (err) {
    failedCount++;
  }
}

var report = "📢 <b>Broadcast Completed!</b> 📊\n\n" +
  "• Total Targeted: <b>" + allUsers.length + " Users</b>\n" +
  "• Successfully Delivered: <b>" + sentCount + "</b>\n" +
  "• Failed / Blocked: <b>" + failedCount + "</b>";

Bot.sendMessage(report, { parse_mode: "HTML" });
