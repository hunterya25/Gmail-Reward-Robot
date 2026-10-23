/*CMD
  command: @
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var adm = Bot.getProperty("adminID");

// 🚫 Ban Enforcement
var _bb_isBan = Bot.getProperty("ban" + user.telegramid);
if (_bb_isBan == "ban" && user.telegramid != adm) {
  Bot.sendMessage("⛔️ *You are banned from using this bot!*", { parse_mode: "Markdown" });
  return;
}

var incomingText = (message || (request && request.message && request.message.text) || "").trim();
var callbackData = (request && request.data ? request.data : "");

// Exempt system commands
var isStartCmd = incomingText.indexOf("/start") === 0;
var isCheckJoin = incomingText.indexOf("/check_join") === 0 || callbackData.indexOf("/check_join") === 0;
var isVerifyCmd = incomingText.indexOf("/verify") === 0 || incomingText.indexOf("/on_verify") === 0 || callbackData.indexOf("/verify") === 0;
var isAdminCmd = incomingText.indexOf("/admin") === 0 || incomingText.indexOf("/set_admin") === 0 || incomingText.indexOf("/loginme") === 0;
var isAdminUser = (user.telegramid == adm);

if (isAdminUser || isStartCmd || isCheckJoin || isVerifyCmd || isAdminCmd) {
  return;
}

// 📢 Channel Join Enforcement
var isJoined = User.getProperty("channel_joined");
if (!isJoined) {
  var joinPrompt = "👋 <b>Welcome to @GmailRewardRobot!</b> 🚀\n\n" +
    "⚠️ <b>Mandatory Verification Step:</b>\n" +
    "To access Gmail rewards and earn through referrals, you <b>MUST</b> join our official updates channel:\n\n" +
    "👉 <a href='https://t.me/BotsByAntares'>📢 @BotsByAntares</a>\n\n" +
    "👇 <b>Please join the channel below and tap Verify:</b>";

  var keyboard = [
    [{ text: "📢 Join @BotsByAntares", url: "https://t.me/BotsByAntares" }],
    [{ text: "✅ Verify Membership", callback_data: "/check_join" }]
  ];

  Api.sendMessage({
    text: joinPrompt,
    parse_mode: "html",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: keyboard }
  });
  return;
}

// 🛡️ Device & IP Verification Enforcement
var isDeviceVerified = User.getProperty("device_verified");
if (!isDeviceVerified) {
  Bot.runCommand("/verify_prompt");
  return;
}
