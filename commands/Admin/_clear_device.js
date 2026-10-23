/*CMD
  command: /clear_device
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
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "html" });
  return;
}

var devId = params ? params.trim() : "";
if (!devId && message && message.indexOf("/clear_device") === 0) {
  devId = message.replace("/clear_device", "").trim();
}

if (!devId) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/clear_device DEV_XXXXX</code>", { parse_mode: "html" });
  return;
}

Bot.setProperty("DeviceOwner_" + devId, null);

Bot.sendMessage("✅ <b>Device Unbound!</b> Device ID <code>" + devId + "</code> has been cleared from anti-cheat registry for testing.", { parse_mode: "html" });
