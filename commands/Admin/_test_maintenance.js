/*CMD
  command: /test_maintenance
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

var maintText = "🚧 <b>System Under Maintenance!</b> 🛠️\n\n" +
  "Our engineers are currently upgrading the bot servers and stocking up fresh Gmails.\n\n" +
  "⏱️ <i>All services will be back online shortly. Thank you for your patience!</i>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "<i>(This is what regular users see when maintenance mode is active)</i>";

Bot.sendMessage(maintText, { parse_mode: "HTML" });
