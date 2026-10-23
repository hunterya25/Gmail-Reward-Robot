/*CMD
  command: /on_check_join_error
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
var errDescription = (options && options.description) ? options.description : "Unknown Telegram Error";

var errPrompt = "⚠️ <b>Channel Verification Error</b>\n\n" +
  "Could not verify your membership in <b>@BotsByAntares</b>.\n" +
  "<i>Details: " + errDescription + "</i>\n\n" +
  "<b>To Admin:</b> Make sure @GmailRewardRobot is added as Administrator with 'Manage Chat' rights in @BotsByAntares!\n\n" +
  "👇 Please make sure you have joined and try again:";

var keyboard = [
  [{ text: "📢 Join @BotsByAntares", url: "https://t.me/BotsByAntares" }],
  [{ text: "🔄 Try Again", callback_data: "/check_join" }]
];

if (request && request.message && request.message.message_id) {
  Api.editMessageText({
    chat_id: chatId,
    message_id: request.message.message_id,
    text: errPrompt,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: keyboard }
  });
} else {
  Api.sendMessage({
    chat_id: chatId,
    text: errPrompt,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: keyboard }
  });
}
