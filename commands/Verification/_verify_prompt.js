/*CMD
  command: /verify_prompt
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Verification

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var botUsername = "GmailRewardRobot";
var defaultWebappUrl = Bot.getProperty("mini_app_url", "https://gmail-reward-robot.vercel.app");
var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// 🗑️ Delete previous bot message for a clean chat
var lastBotMsg = User.getProperty("last_bot_msg_id");
if (lastBotMsg) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: lastBotMsg });
  } catch (e) {}
  User.setProperty("last_bot_msg_id", null);
}

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

// Ensure URL has user params
var fullWebappUrl = defaultWebappUrl;
if (fullWebappUrl.indexOf("?") === -1) {
  fullWebappUrl += "?uid=" + user.telegramid + "&bot=" + botUsername;
} else {
  fullWebappUrl += "&uid=" + user.telegramid + "&bot=" + botUsername;
}

var promptText = "🛡️ <b>Step 2: Device & IP Verification</b> ⚡️\n\n" +
  "To prevent multi-accounting, fake referrals, and duplicate devices, please complete the <b>2–3 second hardware & IP integrity check</b>.\n\n" +
  "🔐 <b>Verification Protocol:</b>\n" +
  "• 📱 <i>Device Hardware & GPU Fingerprint</i> (strictly detects same phone/PC)\n" +
  "• 🌐 <i>Public IP & Network Subnet Check</i>\n" +
  "• 🔒 <i>Anti-Duplicate Multi-Account Check</i>\n\n" +
  "👇 <b>Tap below to launch verification:</b>";

// Only real verification button (Simulator removed!)
var keyboard = [
  [{ text: "🔐 Verify Device & IP", web_app: { url: fullWebappUrl } }]
];

Api.sendMessage({
  chat_id: chatId,
  text: promptText,
  parse_mode: "HTML",
  disable_web_page_preview: true,
  reply_markup: { inline_keyboard: keyboard },
  on_result: "/on_save_msg"
});
