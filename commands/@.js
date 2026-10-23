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

  // 1. 🚫 Ban Enforcement
  var isBanned = Bot.getProperty("ban_" + user.telegramid);
  if (isBanned && !isAdm) {
    Bot.sendMessage("⛔️ <b>Access Denied: You are permanently banned from @GmailRewardRobot.</b>", { parse_mode: "HTML" });
    return;
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
  // Enforce channel membership for non-admin users on general menu interactions
  var targetChannel = Bot.getProperty("mandatory_channel", "@BotsByAntares");
  var bypassCommands = ["/start", "/check_join", "/on_check_join", "/on_verify", "/verify_prompt", "/verify_sim", "/admin", "/set_admin"];
  var currentCmd = message ? message.split(" ")[0] : "";

  if (!isAdm && bypassCommands.indexOf(currentCmd) === -1) {
    // If user marked as not joined, block immediately
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
}
