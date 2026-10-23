/*CMD
  command: /user_info
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

var targetInput = params ? params.trim() : "";
if (!targetInput && message) {
  targetInput = message.replace("/user_info", "").trim();
}

if (!targetInput) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/user_info &lt;TELEGRAM_USER_ID&gt;</code>", { parse_mode: "HTML" });
  return;
}

var targetId = targetInput;

var uBal = 0;
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    uBal = Libs.ResourcesLib.anotherUserRes("balance", targetId).value();
  } else {
    uBal = Bot.getProperty("balance_" + targetId) || 0;
  }
} catch (e) {
  uBal = Bot.getProperty("balance_" + targetId) || 0;
}

var uRefs = Bot.getProperty("total_referrals_" + targetId) || 0;
var uDev = Bot.getProperty("UserDevice_" + targetId) || "Not Detected / Cleared";
var uIp = Bot.getProperty("UserIp_" + targetId) || "Not Detected";

// Ban evaluation
var isBannedProp = Bot.getProperty("ban_" + targetId);
var bannedList = Bot.getProperty("BannedUsersList") || [];
var isTargetBanned = (isBannedProp === true || isBannedProp === "true");
for (var b = 0; b < bannedList.length; b++) {
  if (bannedList[b] && bannedList[b].toString() === targetId.toString()) {
    isTargetBanned = true;
    break;
  }
}
if (isBannedProp === false || isBannedProp === "false") {
  isTargetBanned = false;
}

// Suspension evaluation
var suspData = Bot.getProperty("SuspendedUser_" + targetId);
var isTargetSuspended = false;
var suspInfo = "";
if (suspData && suspData.suspended_until) {
  var now = Date.now();
  if (now < suspData.suspended_until) {
    isTargetSuspended = true;
    suspInfo = "⏳ SUSPENDED (Until: " + suspData.unban_at_ist + ")";
  }
}

var statusStr = "✅ ACTIVE";
if (isTargetBanned) {
  statusStr = "⛔ PERMANENTLY BANNED";
} else if (isTargetSuspended) {
  statusStr = suspInfo;
}

var profileText = "👤 <b>User Deep Profile Inspection</b> 🔍\n\n" +
  "• 🆔 <b>Telegram ID:</b> <code>" + targetId + "</code>\n" +
  "• 🔒 <b>Account Status:</b> <b>" + statusStr + "</b>\n" +
  "• 💰 <b>Current Balance:</b> <b>" + uBal + " Credits</b>\n" +
  "• 👥 <b>Verified Referrals:</b> <b>" + uRefs + "</b>\n" +
  "• 📱 <b>Hardware Device:</b>\n<code>" + uDev + "</code>\n" +
  "• 🌐 <b>Registered IP:</b> <code>" + uIp + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "👇 <i>Quick administration actions for this user:</i>";

var banBtn = isTargetBanned
  ? { text: "🔓 Unban User", callback_data: "/unban " + targetId }
  : { text: "⛔ Ban User", callback_data: "/ban " + targetId };

var suspBtn = isTargetSuspended
  ? { text: "🔓 Lift Suspension", callback_data: "/unsuspend " + targetId }
  : { text: "⏳ Suspend User", callback_data: "/prompt_suspend" };

var kbd = [
  [
    { text: "➕ Add Balance", callback_data: "/add_bal " + targetId + " 1" },
    { text: "➖ Cut Balance", callback_data: "/cut_bal " + targetId + " 1" }
  ],
  [
    banBtn,
    suspBtn
  ],
  [
    { text: "📱 Reset Device", callback_data: "/clear_device " + targetId },
    { text: "✉️ Send Message", callback_data: "/prompt_msg_user" }
  ],
  [{ text: "🔙 Back to Users Division", callback_data: "/admin_users" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: profileText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
