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

if (user && user.telegramid) {
  var isAdm = (adm && user.telegramid.toString() === adm.toString());

  // 1. 🚫 Strict Ban Enforcement
  var isBannedProp = Bot.getProperty("ban_" + user.telegramid);
  var bannedList = Bot.getProperty("BannedUsersList") || [];
  var isUserBanned = false;

  if (isBannedProp === true || isBannedProp === "true") {
    isUserBanned = true;
  }
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
    if (!inBList) {
      isUserBanned = false;
    }
  }

  if (isUserBanned && !isAdm) {
    Bot.sendMessage("⛔️ <b>Access Denied: You are permanently banned from @GmailRewardRobot.</b>", { parse_mode: "HTML" });
    return;
  }

  // 1.5 ⏳ Strict Suspension Enforcement
  var rawUntil = Bot.getProperty("SuspendedUntil_" + user.telegramid);
  var untilMs = rawUntil ? parseInt(rawUntil) : 0;
  var nowMs = Date.now();

  // Fallback to SuspendedUser_ if SuspendedUntil_ wasn't present
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
      // Access is restored immediately! Send celebratory notification to user.
      var unbanNotice = "🎉 <b>Account Suspension Period Completed!</b> 🔓\n\n" +
        "Aapka temporary suspension period pura ho chuka hai aur aapka account <b>automatically unsuspend</b> kar diya gaya hai!\n\n" +
        "✅ <b>Status:</b> All bot features and reward privileges restored. Welcome back!";
      Bot.sendMessage(unbanNotice, { parse_mode: "HTML" });
    } else {
      // ⛔ Still Suspended: Show remaining time in IST and block
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

  // 2. 🚧 Maintenance Mode Enforcement
  var isMaintenance = Bot.getProperty("maintenance_mode");
  if (isMaintenance && !isAdm) {
    var maintText = "🚧 <b>System Under Maintenance!</b> 🛠️\n\n" +
      "Our engineers are currently upgrading the bot servers and stocking up fresh Gmails.\n\n" +
      "⏱️ <i>All services will be back online shortly. Thank you for your patience!</i>";
    Bot.sendMessage(maintText, { parse_mode: "HTML" });
    return;
  }

  // 3. 📢 Real-Time Channel Leave Enforcement
  var targetChannel = Bot.getProperty("mandatory_channel", "@BotsByAntares");
  var bypassCommands = ["/start", "/check_join", "/on_check_join", "/on_verify", "/verify_prompt", "/verify_sim", "/admin", "/set_admin"];
  var currentCmd = message ? message.split(" ")[0] : "";

  if (!isAdm && bypassCommands.indexOf(currentCmd) === -1) {
    var isJoined = User.getProperty("channel_joined");
    if (isJoined === false) {
      var channelUrl = "https://t.me/" + targetChannel.replace("@", "");
      var failMsg = "⚠️ <b>Channel Membership Required!</b>\n\n" +
        "You must be an active member of <b>" + targetChannel + "</b> to use this bot!\n" +
        "<i>If you recently left, please rejoin to unlock your account features.</i>\n\n" +
        "👇 <b>Join below and tap Verify:</b>";

      var keyboard = [
        [{ text: "📢 Join " + targetChannel, url: channelUrl }],
        [{ text: "✅ Verify Membership", callback_data: "/check_join" }]
      ];

      Api.sendMessage({
        chat_id: chat ? chat.chatid : user.telegramid,
        text: failMsg,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: keyboard },
        on_result: "/on_save_msg"
      });
      return;
    }
  }

  // 4. Standalone Promo Code Auto-Detection
  if (message && message.indexOf("/") !== 0 && message.length <= 30) {
    var rawText = message.trim();
    var isMenuBtn = (rawText.indexOf("Balance") !== -1 || rawText.indexOf("GetMail") !== -1 || rawText.indexOf("Refer") !== -1 || rawText.indexOf("Custom") !== -1 || rawText.indexOf("Stock") !== -1 || rawText.indexOf("Leaderboard") !== -1 || rawText.indexOf("Device") !== -1 || rawText.indexOf("Promo") !== -1 || rawText.indexOf("Support") !== -1 || rawText.indexOf("FAQ") !== -1);
    if (!isMenuBtn) {
      var possibleCode = rawText.toUpperCase();
      var promoList = Bot.getProperty("PromoCodesList") || [];
      for (var pi = 0; pi < promoList.length; pi++) {
        if (promoList[pi] && promoList[pi].code === possibleCode) {
          Bot.runCommand("/promo " + possibleCode);
          return;
        }
      }
    }
  }
}
