/*CMD
  command: /reset_all
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

// If no admin set yet, let current user claim admin
if (!adm) {
  Bot.setProperty("adminID", user.telegramid, "integer");
  adm = user.telegramid;
}

if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized: Admin access only!</b>", { parse_mode: "HTML" });
  return;
}

var chatId = (chat && chat.chatid) ? chat.chatid : user.telegramid;

// Delete previous command message if possible
if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var warnText = "⚠️ <b>CONFIRM COMPLETE SYSTEM RESET?</b> ⚠️\n\n" +
  "This action will permanently wipe:\n" +
  "• 📱 <b>All Registered Devices</b> (Hardware fingerprints cleared)\n" +
  "• 🌐 <b>All IP & Network Bindings</b> (WiFi/Hotspot records cleared)\n" +
  "• 👤 <b>All User Verification States</b> (Channel join & Device verify reset)\n" +
  "• 💰 <b>All Referral Tracking & Balances</b>\n\n" +
  "<i>Are you 100% sure you want to wipe everything and start testing from scratch?</i>";

var confirmKeyboard = [
  [
    { text: "⚠️ Yes, Confirm Full Reset", callback_data: "/reset_all_confirm" },
    { text: "❌ Cancel", callback_data: "/reset_all_cancel" }
  ]
];

Api.sendMessage({
  chat_id: chatId,
  text: warnText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: confirmKeyboard }
});
