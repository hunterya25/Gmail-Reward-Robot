/*CMD
  command: /support
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 💬 Support, Support, /contact
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var supportHandle = Bot.getProperty("support_username", "@BotsByAntares");

var supportText = "💬 <b>Need Help or Have Questions?</b> 🤝\n\n" +
  "Our support team is available to assist you with:\n" +
  "• Questions regarding custom Gmail orders\n" +
  "• Troubleshooting login or verification issues\n" +
  "• Partnership and bulk inventory inquiries\n\n" +
  "👉 <b>Official Support:</b> <a href='https://t.me/" + supportHandle.replace("@", "") + "'>" + supportHandle + "</a>\n" +
  "📢 <b>Announcements:</b> <a href='https://t.me/BotsByAntares'>@BotsByAntares</a>\n\n" +
  "<i>Tap the button below to message our team directly:</i>";

var kbd = [
  [{ text: "💬 Contact Support Directly", url: "https://t.me/" + supportHandle.replace("@", "") }],
  [{ text: "🏠 Main Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: supportText,
  parse_mode: "HTML",
  disable_web_page_preview: true,
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});
