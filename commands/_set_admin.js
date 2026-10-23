/*CMD
  command: /set_admin
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /loginme
  group: 
CMD*/

var existingAdmin = Bot.getProperty("adminID");

if (existingAdmin && user.telegramid.toString() !== existingAdmin.toString()) {
  Bot.sendMessage("⛔️ <b>Access Denied!</b> Admin ID is already configured. Only the current admin can change this setting.", { parse_mode: "html" });
  return;
}

var newAdminId = params ? params.trim() : user.telegramid.toString();
Bot.setProperty("adminID", newAdminId, "string");
Bot.setProperty("admin_chat", newAdminId, "string");

Bot.sendMessage(
  "✅ <b>Admin Configured Successfully!</b> 👑\n\n" +
  "🆔 <b>Admin ID:</b> <code>" + newAdminId + "</code>\n\n" +
  "You can now run <code>/admin</code> to open the Management Dashboard.",
  { parse_mode: "html" }
);
