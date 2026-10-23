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

  // 1. Check if user arrived via verification redirect from Mini App
  var rawParams = params ? params.trim() : "";
  if (!rawParams && message && message.indexOf("/start ") === 0) {
    rawParams = message.replace("/start ", "").trim();
  }

  if (rawParams.indexOf("v_") === 0 || rawParams.indexOf("verify_") === 0) {
    Bot.runCommand("/on_verify " + rawParams);
    return;
  }

  // Check if admin triggered a full reset for this user or global reset
  var globalReset = Bot.getProperty("GlobalResetTimestamp");
  var userLastReset = User.getProperty("last_reset_time") || 0;
  var needsReset = (user && Bot.getProperty("ResetUser_" + user.telegramid)) || (globalReset && userLastReset < globalReset);

  if (needsReset) {
    User.setProperty("channel_joined", false, "boolean");
    User.setProperty("device_verified", false, "boolean");
    User.setProperty("registered", false, "boolean");
    User.setProperty("is_duplicate", false, "boolean");
    User.setProperty("verified_device_id", null);
    User.setProperty("verified_ip", null);
    User.setProperty("pending_referrer", null);
    User.setProperty("referrerId", null);
    User.setProperty("last_reset_time", Date.now(), "integer");
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
    if (user) {
      Bot.setProperty("ResetUser_" + user.telegramid, null);
    }
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
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: keyboard },
      on_result: "/on_save_msg"
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
    "💰 Balance,📧 GetMail\n👥 Refer & Earn,📜 My Mails\n🎯 Custom Order,📦 Live Stock\n🏆 Leaderboard,🛡️ My Device\nℹ️ Rules & FAQ,💬 Support",
    dashboardText
  );

} catch (err) {
  Bot.sendMessage("⚠️ <b>System Error in /start:</b> " + err, { parse_mode: "HTML" });
}
