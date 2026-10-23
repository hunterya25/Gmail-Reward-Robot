/*CMD
  command: /reset_all_confirm
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

var chatId = (chat && chat.chatid) ? chat.chatid : user.telegramid;

// 1. Delete confirmation inline message
if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

// 2. Wipe all registered device bindings
var devKeys = Bot.getProperty("RegisteredDeviceKeys");
if (devKeys && Array.isArray(devKeys)) {
  for (var i = 0; i < devKeys.length; i++) {
    Bot.setProperty("DeviceOwner_" + devKeys[i], null);
  }
}
Bot.setProperty("RegisteredDeviceKeys", [], "json");

// 3. Wipe all registered IP bindings
var ipKeys = Bot.getProperty("RegisteredIpKeys");
if (ipKeys && Array.isArray(ipKeys)) {
  for (var j = 0; j < ipKeys.length; j++) {
    Bot.setProperty("IpOwner_" + ipKeys[j], null);
  }
}
Bot.setProperty("RegisteredIpKeys", [], "json");

// 4. Wipe all user mapping and flag them for full reset
var allUsers = Bot.getProperty("all_bot_users");
if (allUsers && Array.isArray(allUsers)) {
  for (var k = 0; k < allUsers.length; k++) {
    var uid = allUsers[k];
    Bot.setProperty("UserDevice_" + uid, null);
    Bot.setProperty("UserIp_" + uid, null);
    Bot.setProperty("ResetUser_" + uid, true, "boolean");
    Bot.setProperty("balance_" + uid, 0, "integer");
    Bot.setProperty("total_referrals_" + uid, 0, "integer");
    Bot.setProperty("UserReferrals_" + uid, [], "json");
  }
}
Bot.setProperty("all_bot_users", [], "json");

// 5. Update Global Reset Timestamp (wipes any user automatically upon /start)
var resetNow = Date.now();
Bot.setProperty("GlobalResetTimestamp", resetNow, "integer");

// 6. Reset current admin user state immediately
User.setProperty("channel_joined", false, "boolean");
User.setProperty("device_verified", false, "boolean");
User.setProperty("registered", false, "boolean");
User.setProperty("is_duplicate", false, "boolean");
User.setProperty("verified_device_id", null);
User.setProperty("verified_ip", null);
User.setProperty("pending_referrer", null);
User.setProperty("referrerId", null);
User.setProperty("last_reset_time", resetNow, "integer");

try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    Libs.ResourcesLib.userRes("balance").set(0);
    Libs.ResourcesLib.userRes("total_referrals").set(0);
  } else {
    User.setProperty("balance", 0, "integer");
    User.setProperty("total_referrals", 0, "integer");
  }
} catch (e) {
  User.setProperty("balance", 0, "integer");
  User.setProperty("total_referrals", 0, "integer");
}

var successText = "💥 <b>SYSTEM RESET COMPLETED!</b> 🔄\n\n" +
  "✅ <b>All device bindings cleared</b> (Devices can register as fresh)\n" +
  "✅ <b>All IP & WiFi records cleared</b>\n" +
  "✅ <b>All user verification statuses reset</b>\n" +
  "✅ <b>All balances & referral counters reset to 0</b>\n\n" +
  "👉 <b>Now send /start to test fresh from the very beginning!</b>";

Api.sendMessage({
  chat_id: chatId,
  text: successText,
  parse_mode: "HTML"
});
