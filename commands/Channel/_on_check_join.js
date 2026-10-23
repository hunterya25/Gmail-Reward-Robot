/*CMD
  command: /on_check_join
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Channel

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

var chs = Bot.getProperty("mandatory_channels");
if (!chs || !Array.isArray(chs) || chs.length === 0) {
  chs = [Bot.getProperty("mandatory_channel", "@BotsByAntares")];
}

var idx = params ? parseInt(params.trim()) : 0;
if (isNaN(idx)) idx = 0;

var memberStatus = (options && options.result) ? options.result.status : "";
var isJoinedCurrent = (memberStatus === "member" || memberStatus === "administrator" || memberStatus === "creator" || memberStatus === "restricted");

if (!isJoinedCurrent) {
  // Missing channel membership
  User.setProperty("channel_joined", false, "boolean");

  var failText = "⚠️ <b>Channel Membership Required!</b>\n\n" +
    "You must join ALL our official announcement channels to proceed:\n\n";

  var keyboard = [];
  for (var c = 0; c < chs.length; c++) {
    var cHandle = chs[c];
    var cUrl = "https://t.me/" + cHandle.replace("@", "");
    failText += (c + 1) + ". <a href='" + cUrl + "'>" + cHandle + "</a>\n";
    keyboard.push([{ text: "📢 Join " + cHandle, url: cUrl }]);
  }

  failText += "\n<i>Please join every channel above, then tap Verify:</i>";
  keyboard.push([{ text: "✅ Verify All Memberships", callback_data: "/check_join" }]);

  if (request && request.message && request.message.message_id) {
    try {
      Api.editMessageText({
        chat_id: chatId,
        message_id: request.message.message_id,
        text: failText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: keyboard }
      });
      return;
    } catch (e) {}
  }

  Api.sendMessage({
    chat_id: chatId,
    text: failText,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: keyboard },
    on_result: "/on_save_msg"
  });
  return;
}

// Channel at idx passed! Check if more channels exist in the list
if (idx + 1 < chs.length) {
  Api.getChatMember({
    chat_id: chs[idx + 1],
    user_id: user.telegramid,
    on_result: "/on_check_join " + (idx + 1),
    on_error: "/on_check_join_error"
  });
  return;
}

// ALL channels passed!
User.setProperty("channel_joined", true, "boolean");

// Delete the channel join prompt message
if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({
      chat_id: chatId,
      message_id: request.message.message_id
    });
  } catch (e) {}
}

// Check if device is verified
var isDeviceVerified = User.getProperty("device_verified");
if (isDeviceVerified) {
  Bot.runCommand("/start");
} else {
  Bot.runCommand("/verify_prompt");
}
