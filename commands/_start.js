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

  var adm = Bot.getProperty("adminID");
  var isAdm = (adm && user && user.telegramid.toString() === adm.toString());

  // Strict Ban Check
  var isBannedProp = Bot.getProperty("ban_" + user.telegramid);
  var bannedList = Bot.getProperty("BannedUsersList") || [];
  var isUserBanned = false;
  if (isBannedProp === true || isBannedProp === "true") isUserBanned = true;
  for (var b = 0; b < bannedList.length; b++) {
    if (bannedList[b] && bannedList[b].toString() === user.telegramid.toString()) {
      isUserBanned = true;
      break;
    }
  }
  if (isBannedProp === false || isBannedProp === "false" || isBannedProp === null || isBannedProp === "null" || isBannedProp === undefined) {
    var inBList = false;
    for (var b2 = 0; b2 < bannedList.length; b2++) {
      if (bannedList[b2] && bannedList[b2].toString() === user.telegramid.toString()) {
        inBList = true;
        break;
      }
    }
    if (!inBList) isUserBanned = false;
  }
  if (isUserBanned && !isAdm) {
    Bot.sendMessage("⛔️ <b>Access Denied: You are permanently banned from @GmailRewardRobot.</b>", { parse_mode: "HTML" });
    return;
  }

  // Strict Suspension Check
  var rawUntil = Bot.getProperty("SuspendedUntil_" + user.telegramid);
  var untilMs = rawUntil ? parseInt(rawUntil) : 0;
  var nowMs = Date.now();

  if (!untilMs) {
    var rawData = Bot.getProperty("SuspendedUser_" + user.telegramid);
    if (typeof rawData === "string" && rawData !== "null" && rawData !== "undefined" && rawData !== "false") {
      try { rawData = JSON.parse(rawData); } catch (e) { rawData = null; }
    }
    if (rawData && rawData.suspended_until) {
      untilMs = parseInt(rawData.suspended_until) || 0;
    }
  }

  if (untilMs && !isNaN(untilMs) && !isAdm) {
    if (nowMs >= untilMs) {
      // ✅ TIME UP! Automatically Unsuspended!
      Bot.setProperty("SuspendedUntil_" + user.telegramid, 0, "integer");
      Bot.setProperty("SuspendedUser_" + user.telegramid, null);
      var sList = Bot.getProperty("SuspendedUsersList") || [];
      var cleanSList = [];
      for (var si = 0; si < sList.length; si++) {
        if (sList[si] && sList[si].toString() !== user.telegramid.toString()) {
          cleanSList.push(sList[si].toString());
        }
      }
      Bot.setProperty("SuspendedUsersList", cleanSList, "json");
      // Access is restored! Send celebratory notification to user.
      var unbanNotice = "🎉 <b>Account Suspension Period Completed!</b> 🔓\n\n" +
        "Aapka temporary suspension period pura ho chuka hai aur aapka account <b>automatically unsuspend</b> kar diya gaya hai!\n\n" +
        "✅ <b>Status:</b> All bot features and reward privileges restored. Welcome back!";
      Bot.sendMessage(unbanNotice, { parse_mode: "HTML" });
    } else {
      var remMs = untilMs - nowMs;
      var remMins = Math.ceil(remMs / 60000);
      var remH = Math.floor(remMins / 60);
      var remM = remMins % 60;
      var remDisplay = "";
      if (remH > 0) remDisplay += remH + "h ";
      remDisplay += remM + "m (" + remMins + " Minutes)";

      var sData = Bot.getProperty("SuspendedUser_" + user.telegramid);
      if (typeof sData === "string" && sData !== "null" && sData !== "undefined") {
        try { sData = JSON.parse(sData); } catch (e) { sData = null; }
      }
      var sReason = (sData && sData.reason) ? sData.reason : "Temporary restriction by Administration";
      var sDuration = (sData && sData.duration) ? sData.duration : "Temporary";
      var sUnbanIST = (sData && sData.unban_at_ist) ? sData.unban_at_ist : "";

      var suspNotice = "⛔ <b>Account Temporarily Suspended!</b> ⏳\n\n" +
        "Aapka account access @GmailRewardRobot par temporary suspend kar diya gaya hai.\n\n" +
        "⚠️ <b>Kyu suspend hua (Reason):</b>\n<i>" + sReason + "</i>\n\n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "⏱️ <b>Suspension Duration:</b> <b>" + sDuration + "</b>\n";

      if (sUnbanIST) {
        suspNotice += "📅 <b>Kab theek hoga (IST Date & Time):</b>\n<b>" + sUnbanIST + "</b>\n";
      }

      suspNotice += "⏳ <b>Kitna time bacha hai:</b> <b>" + remDisplay + "</b>\n\n" +
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "<i>💡 Time pura hote hi aapka account automatically unlock ho jayega!</i>";

      Bot.sendMessage(suspNotice, { parse_mode: "HTML" });
      return;
    }
  }

  // Strict Maintenance Mode Gate
  if (Bot.getProperty("maintenance_mode") && !isAdm) {
    var maintText = "🚧 <b>System Under Maintenance!</b> 🛠️\n\n" +
      "Our engineers are currently upgrading the bot servers and stocking up fresh Gmails.\n\n" +
      "⏱️ <i>All services will be back online shortly. Thank you for your patience!</i>";
    Bot.sendMessage(maintText, { parse_mode: "HTML" });
    return;
  }

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

      // 🔔 Notify Admin about New User Registration
      var adminTarget = Bot.getProperty("adminID");
      if (adminTarget && user.telegramid.toString() !== adminTarget.toString()) {
        function getISTNow() {
          var d = new Date();
          var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
          var istDate = new Date(utc + (3600000 * 5.5));
          var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          var day = istDate.getDate();
          var month = months[istDate.getMonth()];
          var year = istDate.getFullYear();
          var h = istDate.getHours();
          var m = istDate.getMinutes();
          var ampm = h >= 12 ? "PM" : "AM";
          h = h % 12;
          h = h ? h : 12;
          var strM = m < 10 ? "0" + m : m;
          var strH = h < 10 ? "0" + h : h;
          return day + " " + month + " " + year + " at " + strH + ":" + strM + " " + ampm + " IST";
        }

        var uName = (user.first_name || "") + " " + (user.last_name || "");
        uName = uName.trim() || "User";
        var uHandle = user.username ? "@" + user.username : "None";
        var uRefBy = rawParams ? rawParams.replace(/^ref/i, "").replace(/^user/i, "").trim() : "";
        var refText = uRefBy ? "<code>" + uRefBy + "</code>" : "Direct (No Referrer)";

        var newRegMsg = "👤 <b>NEW USER REGISTERED!</b> 🚀\n\n" +
          "• 🆔 <b>Telegram ID:</b> <code>" + user.telegramid + "</code>\n" +
          "• 👤 <b>Name:</b> " + uName + "\n" +
          "• 🌐 <b>Username:</b> " + uHandle + "\n" +
          "• 🔗 <b>Referred By:</b> " + refText + "\n" +
          "• 📊 <b>Total Bot Users:</b> <b>" + fullUsers.length + "</b>\n" +
          "• 📅 <b>Time (IST):</b> <code>" + getISTNow() + "</code>\n\n" +
          "⚡ <i>Action: Tap below to inspect profile</i>";

        try {
          Api.sendMessage({
            chat_id: adminTarget,
            text: newRegMsg,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "🔍 Inspect Profile", callback_data: "/user_info " + user.telegramid }]
              ]
            }
          });
        } catch (e) {}
      }
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

  // 4. Check Mandatory Channel Join (Multi-Channel Gate)
  var chs = Bot.getProperty("mandatory_channels");
  if (!chs || !Array.isArray(chs) || chs.length === 0) {
    chs = [Bot.getProperty("mandatory_channel", "@BotsByAntares")];
  }
  var isJoined = User.getProperty("channel_joined");
  if (!isJoined) {
    var welcomeText = "👋 <b>Welcome to @GmailRewardRobot!</b> 💎\n\n" +
      "🌟 <i>The Premier Automated Gmail Rewards Platform</i>\n\n" +
      "🎁 <b>Earn Free Verified Gmail Accounts</b> simply by inviting real friends!\n" +
      "🛡️ <b>Strict Anti-Cheat Protected:</b> Every referral must pass hardware & IP integrity verification. Duplicate accounts on the same device receive no reward!\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "📢 <b>Step 1: Mandatory Channel Join</b>\n" +
      "You must join our official announcements channels to proceed:\n\n";

    var keyboard = [];
    for (var c = 0; c < chs.length; c++) {
      var cHandle = chs[c];
      var cUrl = "https://t.me/" + cHandle.replace("@", "");
      welcomeText += (c + 1) + ". <a href='" + cUrl + "'>" + cHandle + "</a>\n";
      keyboard.push([{ text: "📢 Join " + cHandle, url: cUrl }]);
    }

    welcomeText += "\n👇 <b>Please join every channel above and tap Verify:</b>";
    keyboard.push([{ text: "✅ Verify All Memberships", callback_data: "/check_join" }]);

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
    "💰 Balance,📧 GetMail\n👥 Refer & Earn,🎟️ Promo Code\n🎯 Custom Order,📦 Live Stock\n🏆 Leaderboard,🛡️ My Device\n💬 Support,ℹ️ Rules & FAQ",
    dashboardText
  );

} catch (err) {
  Bot.sendMessage("⚠️ <b>System Error in /start:</b> " + err, { parse_mode: "HTML" });
}
