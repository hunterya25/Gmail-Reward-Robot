/*CMD
  command: /set_webapp
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

var newUrl = params ? params.trim() : "";
if (!newUrl && message && message.indexOf("/set_webapp") === 0) {
  newUrl = message.replace("/set_webapp", "").trim();
}

if (!newUrl || newUrl.indexOf("http") !== 0) {
  Bot.sendMessage(
    "⚠️ <b>Invalid URL!</b>\n\nUsage: <code>/set_webapp https://your-domain.com/webapp</code>",
    { parse_mode: "html" }
  );
  return;
}

Bot.setProperty("mini_app_url", newUrl, "string");

Bot.sendMessage(
  "✅ <b>Verification Mini App URL Updated!</b>\n\n" +
  "🌐 <b>Active URL:</b>\n<code>" + newUrl + "</code>",
  { parse_mode: "html" }
);
