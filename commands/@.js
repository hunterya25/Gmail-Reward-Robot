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
}
