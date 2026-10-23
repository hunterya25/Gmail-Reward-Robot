/*CMD
  command: /start
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: ⬅️ back, 🏠 home, /menu
  group: 
CMD*/

try {
  var botUsername = "GmailRewardRobot";
  var channelUsername = "@BotsByAntares";
  var channelUrl = "https://t.me/BotsByAntares";
  var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

  // 1. Check if user arrived via verification redirect from Mini App
  var rawParams = params ? params.trim() : "";
  if (!rawParams && message && message.indexOf("/start ") === 0) {
    rawParams = message.replace("/start ", "").trim();
  }

  if (rawParams.indexOf("v_") === 0 || rawParams.indexOf("verify_") === 0) {
    Bot.runCommand("/on_verify " + rawParams);
    return;
  }

  // 2. Track unique user registration
  var fullUsers = Bot.getProperty("all_bot_users");
  if (!fullUsers || !Array.isArray(fullUsers)) {
    fullUsers = [];
  }
  var isAlreadyUser = User.getProperty("registered");
  if (!isAlreadyUser) {
    if (user && user.telegramid) {
      fullUsers.push(user.telegramid);
      Bot.setProperty("all_bot_users", fullUsers, "json");
      User.setProperty("registered", true, "boolean");
    }
  }

  // 3. Process Deep-Link Referral Parameter (Pending Verification)
  var rawRef = rawParams.replace(/^ref/i, "").replace(/^user/i, "").trim();
  if (rawRef && /^\d+$/.test(rawRef) && user) {
    if (rawRef === user.telegramid.toString()) {
      Bot.sendMessage("⚠️ *Self-Referral Blocked!*\n\n_You cannot use your own referral link. Multi-account detection is active._", { parse_mode: "Markdown" });
    } else if (!isAlreadyUser && !User.getProperty("referrerId")) {
      User.setProperty("pending_referrer", rawRef, "string");
    }
  }

  // 4. Check Mandatory Channel Join (@BotsByAntares)
  var isJoined = User.getProperty("channel_joined");
  if (!isJoined) {
    var welcomeText = "👋 <b>Welcome to @GmailRewardRobot!</b> 💎\n\n" +
      "🌟 <i>The Premier Automated Gmail Rewards Platform</i>\n\n" +
      "🎁 <b>Earn Free Verified Gmail Accounts</b> simply by inviting real friends!\n" +
      "🛡️ <b>Strict Anti-Cheat Protected:</b> Every referral must pass hardware & IP integrity verification. Duplicate accounts on the same device receive no reward!\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "📢 <b>Step 1: Mandatory Channel Join</b>\n" +
      "You must join our official announcements channel to proceed:\n\n" +
      "👉 <a href='" + channelUrl + "'>" + channelUsername + "</a>\n\n" +
      "👇 <b>Please join the channel below and tap Verify:</b>";

    var keyboard = [
      [{ text: "📢 Join " + channelUsername, url: channelUrl }],
      [{ text: "✅ Verify Membership", callback_data: "/check_join" }]
    ];

    Api.sendMessage({
      chat_id: chatId,
      text: welcomeText,
      parse_mode: "html",
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: keyboard }
    });
    return;
  }

  // 5. Check Device & IP Verification Status
  var isDeviceVerified = User.getProperty("device_verified");
  if (!isDeviceVerified) {
    Bot.runCommand("/verify_prompt");
    return;
  }

  // 6. User is Fully Verified -> Show Main Dashboard
  var curBalance = 0;
  var totalRefs = 0;

  try {
    if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
      var balanceRes = Libs.ResourcesLib.userRes("balance");
      curBalance = balanceRes ? balanceRes.value() : 0;
      var refRes = Libs.ResourcesLib.userRes("total_referrals");
      totalRefs = refRes ? refRes.value() : 0;
    } else {
      curBalance = User.getProperty("balance") || 0;
      totalRefs = User.getProperty("total_referrals") || 0;
    }
  } catch (libErr) {
    curBalance = User.getProperty("balance") || 0;
    totalRefs = User.getProperty("total_referrals") || 0;
  }

  var isDuplicate = User.getProperty("is_duplicate");
  var statusEmoji = isDuplicate ? "⚠️ Duplicate Device (Restricted)" : "✅ Verified Unique Device";

  var dashboardText = "👋 <b>Welcome to @GmailRewardRobot Dashboard!</b> 🚀\n\n" +
    "🛡️ <b>Security Status:</b> <code>" + statusEmoji + "</code>\n" +
    "💰 <b>Gmail Balance:</b> <b>" + curBalance + " Credits</b>\n" +
    "👥 <b>Total Verified Referrals:</b> <b>" + totalRefs + "</b>\n\n" +
    "<i>Refer friends to earn 1 Gmail credit per verified user!</i>\n\n" +
    "👇 <b>Choose an action from the menu below:</b>";

  Bot.sendKeyboard(
    "💰 Balance,📧 GetMail\n👥 Refer & Earn",
    dashboardText
  );

} catch (err) {
  Bot.sendMessage("⚠️ <b>System Error in /start:</b> " + err, { parse_mode: "html" });
}
