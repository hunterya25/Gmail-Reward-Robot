/*CMD
  command: /on_check_join_silent
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

if (!options || !options.result) return;

var status = options.result.status;
var isJoined = (status === "member" || status === "administrator" || status === "creator" || status === "restricted");

if (!isJoined) {
  User.setProperty("channel_joined", false, "boolean");

  var failMsg = "⚠️ <b>Channel Membership Required!</b>\n\n" +
    "You have left our official channel <b>@BotsByAntares</b>!\n" +
    "<i>Your bot access and Gmail claims have been paused until you rejoin.</i>\n\n" +
    "👇 <b>Please re-join and verify:</b>";

  var keyboard = [
    [{ text: "📢 Re-join @BotsByAntares", url: "https://t.me/BotsByAntares" }],
    [{ text: "✅ Verify Membership", callback_data: "/check_join" }]
  ];

  Api.sendMessage({
    chat_id: chat.chatid,
    text: failMsg,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: keyboard },
    on_result: "/on_save_msg"
  });
}
