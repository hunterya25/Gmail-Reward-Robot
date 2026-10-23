/*CMD
  command: /set_channel
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /set_support
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var cmd = message ? message.split(" ")[0].toLowerCase() : "/set_channel";
var input = params ? params.trim() : "";
if (!input && message) {
  input = message.replace(cmd, "").trim();
}

if (!input) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>" + cmd + " @channel_or_username</code>", { parse_mode: "HTML" });
  return;
}

if (input.indexOf("@") !== 0 && input.indexOf("https://t.me/") === -1) {
  input = "@" + input;
}

if (cmd === "/set_channel") {
  Bot.setProperty("mandatory_channel", input, "string");
  Bot.sendMessage("✅ <b>Mandatory Join Channel Updated:</b> <code>" + input + "</code>\n\n<i>New and existing users will be required to join this channel!</i>", { parse_mode: "HTML" });
} else if (cmd === "/set_support") {
  Bot.setProperty("support_username", input, "string");
  Bot.sendMessage("✅ <b>Support Contact Handle Updated:</b> <code>" + input + "</code>", { parse_mode: "HTML" });
}
