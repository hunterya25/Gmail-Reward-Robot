/*CMD
  command: /admin_promos
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

var promoList = Bot.getProperty("PromoCodesList") || [];

var promoText = "🎟️ <b>Promo Codes Management Division</b> 💰\n\n" +
  "• 📊 <b>Total Created Promo Codes:</b> <b>" + promoList.length + "</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n";

if (promoList.length === 0) {
  promoText += "<i>No promo codes active yet. Use /create_promo to launch a new promotion!</i>\n\n";
} else {
  for (var i = 0; i < Math.min(promoList.length, 10); i++) {
    var p = promoList[i];
    var statusBadge = (p.status === "Active") ? "🟢 Active" : "⏸️ Disabled";
    promoText += "<b>#" + (i + 1) + " CODE:</b> <code>" + p.code + "</code>\n" +
      "• Reward: <b>+" + p.amount + " Credits</b>\n" +
      "• Redemption Limit: <b>" + p.used_count + " / " + p.max_users + " Users</b>\n" +
      "• Status: " + statusBadge + "\n" +
      "• Created: <i>" + (p.created_at || "N/A") + "</i>\n" +
      "• Actions: <code>/toggle_promo " + p.code + "</code> | <code>/del_promo " + p.code + "</code>\n\n";
  }
}

promoText += "⚡️ <b>Quick Commands Available:</b>\n" +
  "• <code>/create_promo &lt;CODE&gt; &lt;AMOUNT&gt; &lt;MAX_USERS&gt;</code>\n" +
  "• <code>/toggle_promo &lt;CODE&gt;</code> — Turn ON or OFF\n" +
  "• <code>/edit_promo &lt;CODE&gt; &lt;NEW_AMT&gt; &lt;NEW_USERS&gt;</code>\n" +
  "• <code>/del_promo &lt;CODE&gt;</code> — Delete promo code\n\n" +
  "👇 <i>Or tap an option below:</i>";

var kbd = [
  [{ text: "➕ Create New Promo Code", callback_data: "/prompt_create_promo" }],
  [{ text: "🔄 Refresh Promo List", callback_data: "/admin_promos" }],
  [{ text: "💰 Return to Pricing Hub", callback_data: "/admin_pricing" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: promoText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
