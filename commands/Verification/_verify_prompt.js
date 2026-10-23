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
var defaultWebappUrl = Bot.getProperty("mini_app_url", "https://antares-bots.github.io/gmail-reward-verifier");
var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// Ensure URL has user params
var fullWebappUrl = defaultWebappUrl;
if (fullWebappUrl.indexOf("?") === -1) {
  fullWebappUrl += "?uid=" + user.telegramid + "&bot=" + botUsername;
} else {
  fullWebappUrl += "&uid=" + user.telegramid + "&bot=" + botUsername;
}

var promptText = "🛡️ <b>Step 2: Device & IP Verification</b> ⚡️\n\n" +
  "To prevent multi-accounting, fake referrals, and bot scripts, we use a <b>2–3 second hardware & IP integrity check</b>.\n\n" +
  "🔐 <b>Verification Protocol:</b>\n" +
  "• 📱 <i>Device Hardware & GPU Fingerprint</i> (blocks second accounts on same phone/PC)\n" +
  "• 🌐 <i>Public IP & Subnet Analysis</i>\n" +
  "• 🔒 <i>Anti-Duplicate Registry Audit</i>\n\n" +
  "👇 <b>Tap the button below to launch the Verification Mini App:</b>";

var keyboard = [
  [{ text: "🔐 Verify Device & IP (Mini App)", web_app: { url: fullWebappUrl } }],
  [{ text: "⚡ Instant Verify (Simulator)", callback_data: "/verify_sim" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: promptText,
  parse_mode: "HTML",
  disable_web_page_preview: true,
  reply_markup: { inline_keyboard: keyboard }
});
