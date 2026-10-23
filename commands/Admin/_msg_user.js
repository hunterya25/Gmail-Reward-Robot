/*CMD
  command: /msg_user
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
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var input = params ? params.trim() : "";
if (!input && message) {
  input = message.replace("/msg_user", "").trim();
}

var parts = input.split(" ");
if (parts.length < 2) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/msg_user &lt;USER_ID&gt; &lt;Your Message Text&gt;</code>", { parse_mode: "HTML" });
  return;
}

var targetId = parts[0].trim();
var textToSend = parts.slice(1).join(" ").trim();

var formattedMsg = "✉️ <b>Direct Message from Administration</b> 🛡️\n\n" +
  textToSend + "\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "<i>Sent privately by @GmailRewardRobot Admin</i>";

try {
  Api.sendMessage({
    chat_id: targetId,
    text: formattedMsg,
    parse_mode: "HTML"
  });

  Bot.sendMessage("✅ <b>Private message sent successfully to User ID:</b> <code>" + targetId + "</code>", { parse_mode: "HTML" });
} catch (err) {
  Bot.sendMessage("❌ <b>Failed to deliver message:</b> " + err, { parse_mode: "HTML" });
}
