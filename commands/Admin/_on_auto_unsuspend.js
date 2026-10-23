/*CMD
  command: /on_auto_unsuspend
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

var targetId = params ? params.trim() : "";
if (!targetId) return;

var rawUntil = Bot.getProperty("SuspendedUntil_" + targetId);
var untilMs = rawUntil ? parseInt(rawUntil) : 0;
var nowMs = Date.now();

// Check if still suspended and time has passed
if (untilMs && !isNaN(untilMs) && nowMs >= untilMs) {
  // Clear suspension properties
  Bot.setProperty("SuspendedUntil_" + targetId, 0, "integer");
  Bot.setProperty("SuspendedUser_" + targetId, null);

  var sList = Bot.getProperty("SuspendedUsersList") || [];
  var cleanSList = [];
  for (var si = 0; si < sList.length; si++) {
    if (sList[si] && sList[si].toString() !== targetId.toString()) {
      cleanSList.push(sList[si].toString());
    }
  }
  Bot.setProperty("SuspendedUsersList", cleanSList, "json");

  // Send automatic unsuspend notification to user
  var unbanMsg = "🎉 <b>Good News! Your Account Suspension Ended!</b> 🔓\n\n" +
    "Aapka temporary suspension period pura ho chuka hai aur aapka account <b>automatically unsuspend</b> ho gaya hai!\n\n" +
    "✅ <b>Status:</b> Full bot & reward privileges restored.\n\n" +
    "<i>Send /start to access your dashboard and claim rewards!</i>";

  try {
    Api.sendMessage({
      chat_id: targetId,
      text: unbanMsg,
      parse_mode: "HTML"
    });
  } catch (e) {}
}
