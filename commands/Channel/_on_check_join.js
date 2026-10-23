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

if (!options || !options.result) {
  Api.sendMessage({
    chat_id: chatId,
    text: "⚠️ <b>Unable to verify membership at this moment.</b> Please try clicking Verify again.",
    parse_mode: "HTML"
  });
  return;
}

var memberStatus = options.result.status;
var isJoined = (memberStatus === "member" || memberStatus === "administrator" || memberStatus === "creator" || memberStatus === "restricted");

if (isJoined) {
  // Mark channel as joined
  User.setProperty("channel_joined", true, "boolean");

  // 🗑️ Delete the channel join prompt message as requested!
  if (request && request.message && request.message.message_id) {
    Api.deleteMessage({
      chat_id: chatId,
      message_id: request.message.message_id
    });
  }

  // Check if device is already verified
  var isDeviceVerified = User.getProperty("device_verified");
  if (isDeviceVerified) {
    Bot.runCommand("/start");
  } else {
    // Send Step 2: Device & IP Verification Prompt with Mini App Inline Button
    Bot.runCommand("/verify_prompt");
  }
} else {
  User.setProperty("channel_joined", false, "boolean");

  var targetChannel = Bot.getProperty("mandatory_channel", "@BotsByAntares");
  var channelUrl = "https://t.me/" + targetChannel.replace("@", "");
  var failText = "⚠️ <b>Channel Membership Required!</b>\n\n" +
    "You have not joined <b>" + targetChannel + "</b> yet!\n\n" +
    "📢 <b>Mandatory Channel:</b>\n" +
    "👉 <a href='" + channelUrl + "'>" + targetChannel + "</a>\n\n" +
    "<i>Please join the channel first, then tap Verify below:</i>";

  var keyboard = [
    [{ text: "📢 Join " + targetChannel, url: channelUrl }],
    [{ text: "✅ Verify Membership", callback_data: "/check_join" }]
  ];

  if (request && request.message && request.message.message_id) {
    Api.editMessageText({
      chat_id: chatId,
      message_id: request.message.message_id,
      text: failText,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: keyboard }
    });
  } else {
    Api.sendMessage({
      chat_id: chatId,
      text: failText,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: keyboard }
    });
  }
}
