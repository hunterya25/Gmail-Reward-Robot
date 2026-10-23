/*CMD
  command: /admin_settings
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

var chatId = (chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var isMaint = Bot.getProperty("maintenance_mode");
var maintStatus = isMaint ? "🔴 ENABLED (Bot Locked for Users)" : "🟢 DISABLED (Normal Operation)";
var curChannel = Bot.getProperty("mandatory_channel", "@BotsByAntares");
var curWebapp = Bot.getProperty("mini_app_url", "https://antares-bots.github.io/gmail-reward-verifier");
var curSupport = Bot.getProperty("support_username", "@BotsByAntares");

var settingsText = "⚙️ <b>Bot Settings & System Configuration Division</b> 🛠️\n\n" +
  "• 🚧 <b>Maintenance Mode:</b>\n" + maintStatus + "\n\n" +
  "• 📢 <b>Mandatory Join Channel:</b>\n<code>" + curChannel + "</code>\n\n" +
  "• 🌐 <b>Mini App Verifier URL:</b>\n<code>" + curWebapp + "</code>\n\n" +
  "• 💬 <b>Official Support Handle:</b>\n<code>" + curSupport + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⚡️ <b>Quick Commands Available:</b>\n" +
  "• <code>/toggle_maintenance</code> — Turn maintenance mode ON or OFF\n" +
  "• <code>/set_channel &lt;@channel&gt;</code> — Update required channel gate\n" +
  "• <code>/set_webapp &lt;https://...&gt;</code> — Update verification webapp URL\n" +
  "• <code>/set_support &lt;@username&gt;</code> — Update support contact handle\n\n" +
  "👇 <i>Or tap an action below:</i>";

var kbd = [
  [{ text: (isMaint ? "🟢 Disable Maintenance Mode" : "🔴 Enable Maintenance Mode"), callback_data: "/toggle_maintenance" }],
  [
    { text: "📢 Change Channel Gate", callback_data: "/prompt_set_channel" },
    { text: "🌐 Change WebApp URL", callback_data: "/prompt_set_webapp" }
  ],
  [
    { text: "💬 Set Support Handle", callback_data: "/prompt_set_support" },
    { text: "⚠️ System Reset", callback_data: "/reset_all" }
  ],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: settingsText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
