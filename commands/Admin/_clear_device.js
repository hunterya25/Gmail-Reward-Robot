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
  targetUserId = parseInt(targetInput);
  devId = Bot.getProperty("UserDevice_" + targetUserId);
}

// 1. Clear device binding
if (devId) {
  Bot.setProperty("DeviceOwner_" + devId, null);
}

// 2. Fully reset target user so they are treated as a completely brand new device
if (targetUserId) {
  Bot.setProperty("UserDevice_" + targetUserId, null);
  
  // Reset User properties
  User.setProperty({ name: "channel_joined", value: false, user_id: targetUserId });
  User.setProperty({ name: "device_verified", value: false, user_id: targetUserId });
  User.setProperty({ name: "registered", value: false, user_id: targetUserId });
  User.setProperty({ name: "is_duplicate", value: false, user_id: targetUserId });
  User.setProperty({ name: "verified_device_id", value: null, user_id: targetUserId });
  User.setProperty({ name: "verified_ip", value: null, user_id: targetUserId });
  User.setProperty({ name: "pending_referrer", value: null, user_id: targetUserId });
  User.setProperty({ name: "referrerId", value: null, user_id: targetUserId });
  User.setProperty({ name: "last_bot_msg_id", value: null, user_id: targetUserId });

  // If admin is clearing themselves
  if (user.telegramid == targetUserId) {
    User.setProperty("channel_joined", false);
    User.setProperty("device_verified", false);
    User.setProperty("registered", false);
    User.setProperty("is_duplicate", false);
    User.setProperty("verified_device_id", null);
  }
}

Bot.sendMessage(
  "✅ <b>Device & User Completely Reset!</b> 🔄\n\n" +
  "📱 <b>Device ID:</b> <code>" + (devId || "N/A") + "</code>\n" +
  "👤 <b>Target User:</b> <code>" + (targetUserId || "Unknown") + "</code>\n\n" +
  "<i>This account will now be treated as a 100% brand new device: forced to rejoin channel and verify device afresh on /start!</i>",
  { parse_mode: "HTML" }
);
