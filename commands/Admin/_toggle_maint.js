/*CMD
  command: /toggle_maintenance
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var currentMode = Bot.getProperty("maintenance_mode");
var newMode = !currentMode;
Bot.setProperty("maintenance_mode", newMode, "boolean");

var statusText = newMode ?
  "🚧 <b>Maintenance Mode ENABLED!</b> 🔴\n\n<i>Regular users are now blocked from using bot features. Only administrators can access the bot.</i>" :
  "🟢 <b>Maintenance Mode DISABLED!</b> ✅\n\n<i>All bot features and Gmail dispensers are now live and accessible to all users!</i>";

var kbd = [
  [{ text: "⚙️ Return to Settings", callback_data: "/admin_settings" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: statusText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
