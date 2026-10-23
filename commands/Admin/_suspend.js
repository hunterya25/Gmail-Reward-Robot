/*CMD
  command: /suspend
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
  input = message.replace("/suspend", "").trim();
}

if (!input) {
  var helpText = "ℹ️ <b>Usage for Suspending a User:</b>\n\n" +
    "<code>/suspend &lt;USER_ID&gt; &lt;TIME&gt; &lt;REASON&gt;</code>\n\n" +
    "<b>Time Formats Supported:</b>\n" +
    "• <code>2h</code> — 2 Hours\n" +
    "• <code>30m</code> — 30 Minutes\n" +
    "• <code>1h30m</code> or <code>1h 30m</code> — 1 Hour 30 Minutes\n" +
    "• <code>24h</code> — 24 Hours\n" +
    "• <code>45m</code> — 45 Minutes\n\n" +
    "<i>Example:</i>\n" +
    "<code>/suspend 8669173066 2h Multi-account self referral attempt</code>\n" +
    "<code>/suspend 8669173066 1h 30m Suspicious device activity</code>";
  Bot.sendMessage(helpText, { parse_mode: "HTML" });
  return;
}

var parts = input.split(" ");
if (parts.length < 2) {
  Bot.sendMessage("❌ <b>Missing parameters.</b>\n\nUsage: <code>/suspend &lt;USER_ID&gt; &lt;TIME&gt; &lt;REASON&gt;</code>\n\n<i>Example:</i> <code>/suspend 8669173066 2h Policy violation</code>", { parse_mode: "HTML" });
  return;
}

var targetId = parts[0].trim();
var timePart1 = parts[1].trim();
var timePart2 = parts.length > 2 ? parts[2].trim() : "";

// Check if parts[2] is part of the duration (e.g. 1h 30m)
var s = timePart1.toLowerCase();
var reasonStartIndex = 2;

var nextWordMatch = timePart2.toLowerCase().match(/^(\d+)\s*(?:m|min|mins|minute|minutes)$/);
if (nextWordMatch) {
  s = (timePart1 + " " + timePart2).toLowerCase();
  reasonStartIndex = 3;
}

var hours = 0;
var mins = 0;
var hMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
var mMatch = s.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/);

if (hMatch) hours = parseFloat(hMatch[1]);
if (mMatch) mins = parseInt(mMatch[1]);

if (!hMatch && !mMatch) {
  var numOnly = parseFloat(timePart1);
  if (!isNaN(numOnly)) {
    hours = numOnly;
  }
}

var totalMs = Math.round((hours * 3600 * 1000) + (mins * 60 * 1000));
if (totalMs <= 0) {
  Bot.sendMessage("❌ <b>Invalid time duration.</b> Use e.g. <code>2h</code>, <code>30m</code>, or <code>1h30m</code>.", { parse_mode: "HTML" });
  return;
}

var reason = parts.slice(reasonStartIndex).join(" ").trim();
if (!reason) {
  reason = "Temporary account restriction by Administration";
}

var totalMins = Math.round(totalMs / 60000);
var displayH = Math.floor(totalMins / 60);
var displayM = totalMins % 60;
var durationLabel = "";
if (displayH > 0) durationLabel += displayH + " Hour" + (displayH > 1 ? "s" : "") + " ";
if (displayM > 0) durationLabel += displayM + " Minute" + (displayM > 1 ? "s" : "");
durationLabel = durationLabel.trim() || "0 Minutes";

var now = Date.now();
var unbanTimeMs = now + totalMs;

function formatIST(ms) {
  var d = new Date(ms);
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  var istDate = new Date(utc + (3600000 * 5.5));
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var day = istDate.getDate();
  var month = months[istDate.getMonth()];
  var year = istDate.getFullYear();
  var h = istDate.getHours();
  var m = istDate.getMinutes();
  var ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  var strM = m < 10 ? "0" + m : m;
  var strH = h < 10 ? "0" + h : h;
  return day + " " + month + " " + year + " at " + strH + ":" + strM + " " + ampm + " IST";
}

var nowIST = formatIST(now);
var unbanIST = formatIST(unbanTimeMs);

var suspData = {
  user_id: targetId,
  reason: reason,
  duration: durationLabel,
  suspended_until: unbanTimeMs,
  suspended_at_ist: nowIST,
  unban_at_ist: unbanIST
};

// 1. Save suspension timestamp as integer (fast & reliable expiration check)
Bot.setProperty("SuspendedUntil_" + targetId, unbanTimeMs, "integer");

// 2. Save detailed suspension property
Bot.setProperty("SuspendedUser_" + targetId, suspData, "json");

// 2. Add to SuspendedUsersList
var suspList = Bot.getProperty("SuspendedUsersList") || [];
var strTarget = targetId.toString();
var exists = false;
for (var i = 0; i < suspList.length; i++) {
  if (suspList[i] && suspList[i].toString() === strTarget) {
    exists = true;
    break;
  }
}
if (!exists) {
  suspList.push(strTarget);
  Bot.setProperty("SuspendedUsersList", suspList, "json");
}

var confirmMsg = "⏳ <b>User Suspended Successfully!</b>\n\n" +
  "• Target ID: <code>" + targetId + "</code>\n" +
  "• Duration: <b>" + durationLabel + "</b>\n" +
  "• Reason: <i>" + reason + "</i>\n" +
  "• Suspended At (IST): <code>" + nowIST + "</code>\n" +
  "• Automatically Lifts At (IST): <b>" + unbanIST + "</b>";

var kbd = [
  [{ text: "🔓 Lift Suspension Now", callback_data: "/unsuspend " + targetId }],
  [{ text: "📋 View Suspended Directory", callback_data: "/suspended_users" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: confirmMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});

// 3. Notify Target User with IST unban date & time and reason
var userNotice = "⛔ <b>Account Temporarily Suspended!</b> ⏳\n\n" +
  "Aapka account access @GmailRewardRobot par temporary suspend kar diya gaya hai.\n\n" +
  "⚠️ <b>Kyu suspend hua (Reason):</b>\n<i>" + reason + "</i>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⏱️ <b>Suspension Duration:</b> <b>" + durationLabel + "</b>\n" +
  "📅 <b>Kab theek hoga (IST Date & Time):</b>\n<b>" + unbanIST + "</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "<i>💡 Time pura hote hi aapka account automatically unlock ho jayega! Dhanyawad.</i>";

try {
  Api.sendMessage({
    chat_id: targetId,
    text: userNotice,
    parse_mode: "HTML"
  });
} catch (e) {}
