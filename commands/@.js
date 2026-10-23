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
if (user && user.telegramid) {
  var _bb_isBan = Bot.getProperty("ban" + user.telegramid);
  if (_bb_isBan == "ban" && user.telegramid != adm) {
    Bot.sendMessage("⛔️ *You are banned from using this bot!*", { parse_mode: "Markdown" });
    return;
  }

  // 📢 Background Channel Leave Enforcement (Periodic Verification)
  if (user.telegramid != adm) {
    var lastCheck = User.getProperty("last_channel_check") || 0;
    var now = new Date().getTime();
    if (now - lastCheck > 3 * 60 * 1000) {
      User.setProperty("last_channel_check", now, "integer");
      Api.getChatMember({
        chat_id: "@BotsByAntares",
        user_id: user.telegramid,
        on_result: "/on_check_join_silent"
      });
    }
  }
}
