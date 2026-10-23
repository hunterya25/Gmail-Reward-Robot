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
  aliases: /set_support, /add_channel, /del_channel, /channels
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

// Function to fetch current channels array safely
function getChannels() {
  var chs = Bot.getProperty("mandatory_channels");
  if (chs && Array.isArray(chs) && chs.length > 0) {
    return chs;
  }
  var old = Bot.getProperty("mandatory_channel", "@BotsByAntares");
  return [old];
}

if (cmd === "/channels") {
  var chList = getChannels();
  var listText = "📢 <b>Active Channel Gate Registry</b> (" + chList.length + ")\n\n" +
    "<i>Users must join ALL channels below before accessing bot features:</i>\n\n";
  for (var i = 0; i < chList.length; i++) {
    listText += (i + 1) + ". <a href='https://t.me/" + chList[i].replace("@", "") + "'>" + chList[i] + "</a>\n";
  }
  listText += "\n⚡️ <b>Commands:</b>\n• <code>/add_channel @username</code>\n• <code>/del_channel @username</code>";

  var kbd = [
    [{ text: "⚙️ Return to Settings", callback_data: "/admin_settings" }],
    [{ text: "👑 Admin Hub", callback_data: "/admin" }]
  ];

  Api.sendMessage({
    chat_id: chat ? chat.chatid : user.telegramid,
    text: listText,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: kbd }
  });
  return;
}

if (cmd === "/set_support") {
  if (!input) {
    Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/set_support @username</code>", { parse_mode: "HTML" });
    return;
  }
  if (input.indexOf("@") !== 0) input = "@" + input;
  Bot.setProperty("support_username", input, "string");
  Bot.sendMessage("✅ <b>Support Contact Handle Updated:</b> <code>" + input + "</code>", { parse_mode: "HTML" });
  return;
}

// Channel Add / Delete / Replace
if (!input) {
  Bot.sendMessage("ℹ️ <b>Usage:</b>\n• <code>/add_channel @newchannel</code>\n• <code>/del_channel @channel</code>\n• <code>/channels</code>", { parse_mode: "HTML" });
  return;
}

if (input.indexOf("@") !== 0 && input.indexOf("https://t.me/") === -1) {
  input = "@" + input;
}

var currentChs = getChannels();

if (cmd === "/add_channel") {
  if (currentChs.indexOf(input) !== -1) {
    Bot.sendMessage("⚠️ Channel <code>" + input + "</code> is already in the channel gate!", { parse_mode: "HTML" });
    return;
  }
  currentChs.push(input);
  Bot.setProperty("mandatory_channels", currentChs, "json");
  Bot.setProperty("mandatory_channel", currentChs[0], "string");
  Bot.sendMessage("✅ <b>Channel Added!</b> <code>" + input + "</code> is now required for all users.\n\nTotal required channels: <b>" + currentChs.length + "</b>", { parse_mode: "HTML" });

} else if (cmd === "/del_channel") {
  var idx = currentChs.indexOf(input);
  if (idx === -1) {
    Bot.sendMessage("❌ Channel <code>" + input + "</code> was not found in the channel gate list.", { parse_mode: "HTML" });
    return;
  }
  currentChs.splice(idx, 1);
  if (currentChs.length === 0) {
    currentChs = ["@BotsByAntares"];
  }
  Bot.setProperty("mandatory_channels", currentChs, "json");
  Bot.setProperty("mandatory_channel", currentChs[0], "string");
  Bot.sendMessage("✅ <b>Channel Removed!</b> <code>" + input + "</code> has been removed from the channel gate.", { parse_mode: "HTML" });

} else if (cmd === "/set_channel") {
  // Sets as single primary channel
  Bot.setProperty("mandatory_channels", [input], "json");
  Bot.setProperty("mandatory_channel", input, "string");
  Bot.sendMessage("✅ <b>Primary Channel Gate Updated:</b> <code>" + input + "</code>", { parse_mode: "HTML" });
}
