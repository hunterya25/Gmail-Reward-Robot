/*CMD
  command: /cat_disabled
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var cat = params ? params.trim().toUpperCase() : "THIS";
var alertText = "⚠️ " + cat + " Gmails are temporarily disabled by administration.\n\nPlease check back later or explore other available categories!";

if (request && request.id) {
  try {
    Api.answerCallbackQuery({
      callback_query_id: request.id,
      text: alertText,
      show_alert: true
    });
    return;
  } catch (e) {}
}

Bot.sendMessage("⚠️ <b>Category Disabled:</b>\n\n" + alertText, { parse_mode: "HTML" });
