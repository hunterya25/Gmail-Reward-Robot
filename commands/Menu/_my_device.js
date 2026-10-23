/*CMD
  command: /my_device
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 🛡️ My Device, My Device
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var isDevVerified = User.getProperty("device_verified");
var isDup = User.getProperty("is_duplicate");
var devId = User.getProperty("verified_device_id") || Bot.getProperty("UserDevice_" + user.telegramid) || "Not Detected";
var devIp = User.getProperty("verified_ip") || Bot.getProperty("UserIp_" + user.telegramid) || "Not Detected";
var isChannel = User.getProperty("channel_joined");

var statusBadge = isDup ? "⚠️ Duplicate Device (Restricted Privileges)" : (isDevVerified ? "✅ Authentic Unique Hardware" : "⏳ Pending Verification");
var channelBadge = isChannel ? "✅ Active Member" : "❌ Not Joined";

var securityCard = "🛡️ <b>Your Device & Account Security Profile</b> 🔍\n\n" +
  "👤 <b>Telegram User ID:</b> <code>" + user.telegramid + "</code>\n" +
  "📱 <b>Hardware Device Signature:</b>\n<code>" + devId + "</code>\n\n" +
  "🌐 <b>Registered Network IP:</b>\n<code>" + devIp + "</code>\n\n" +
  "📢 <b>Official Channel Status:</b> " + channelBadge + "\n" +
  "🔒 <b>Anti-Cheat Status:</b> " + statusBadge + "\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "ℹ️ <b>How it works:</b>\n" +
  "Our system secures referral bonuses by binding each Telegram account to an invariant hardware signature. Authentic unique devices earn full reward privileges!";

var kbd = [
  [{ text: "🔐 Verify / Refresh Device", callback_data: "/verify_prompt" }],
  [{ text: "🏠 Main Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: securityCard,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});
