/*CMD
  command: /clear_device
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
if (!targetInput && message && message.indexOf("/clear_device") === 0) {
  targetInput = message.replace("/clear_device", "").trim();
}

if (!targetInput) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/clear_device DEV_ID</code> or <code>/clear_device USER_TELEGRAM_ID</code>", { parse_mode: "HTML" });
  return;
}

var targetUserId = null;
var devId = null;

if (targetInput.indexOf("DEV_") === 0) {
  devId = targetInput;
  targetUserId = Bot.getProperty("DeviceOwner_" + devId);
} else {
  targetUserId = targetInput.trim();
  devId = Bot.getProperty("UserDevice_" + targetUserId);
}

// 1. Clear device binding
if (devId) {
  Bot.setProperty("DeviceOwner_" + devId, null);
}

// 2. Queue full reset flag for target user and clear IP binding
if (targetUserId) {
  var userIp = Bot.getProperty("UserIp_" + targetUserId);
  if (userIp) {
    Bot.setProperty("IpOwner_" + userIp, null);
    Bot.setProperty("UserIp_" + targetUserId, null);
  }
  Bot.setProperty("UserDevice_" + targetUserId, null);
  Bot.setProperty("ResetUser_" + targetUserId, true, "boolean");

  // If admin is clearing themselves in this session
  if (user.telegramid.toString() === targetUserId.toString()) {
    User.setProperty("channel_joined", false, "boolean");
    User.setProperty("device_verified", false, "boolean");
    User.setProperty("registered", false, "boolean");
    User.setProperty("is_duplicate", false, "boolean");
    User.setProperty("verified_device_id", null);
    User.setProperty("verified_ip", null);
    User.setProperty("pending_referrer", null);
    User.setProperty("referrerId", null);
    Bot.setProperty("ResetUser_" + targetUserId, null);
  }
}

Bot.sendMessage(
  "✅ <b>Device & User Completely Reset!</b> 🔄\n\n" +
  "📱 <b>Device ID:</b> <code>" + (devId || "N/A") + "</code>\n" +
  "👤 <b>Target User:</b> <code>" + (targetUserId || "Unknown") + "</code>\n\n" +
  "<i>Device registry cleared! User will be treated as 100% brand new on /start (forced to rejoin channel and verify again).</i>",
  { parse_mode: "HTML" }
);
