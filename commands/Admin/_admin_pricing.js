/*CMD
  command: /admin_pricing
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

var pNorm = Bot.getProperty("Price_Normal") || 1;
var pRec = Bot.getProperty("Price_Recovery") || 2;
var p2FA = Bot.getProperty("Price_2FA") || 3;
var pCust = Bot.getProperty("Price_Custom") || 5;
var pRef = Bot.getProperty("Ref_Reward_Amount") || 1;

var priceText = "💰 <b>Pricing & Economy Configuration Division</b> 🏷️\n\n" +
  "🌟 <i>Configure credit costs for claiming Gmails and referral bonus payouts:</i>\n\n" +
  "• 🟢 <b>Normal Fresh Gmail:</b> <b>" + pNorm + " Credit</b>\n" +
  "• 🛡️ <b>Recovery Attached Gmail:</b> <b>" + pRec + " Credits</b>\n" +
  "• 🔐 <b>2-Step Verification (2FA):</b> <b>" + p2FA + " Credits</b>\n" +
  "• 🎯 <b>Custom Order Gmail:</b> <b>" + pCust + " Credits</b>\n" +
  "• 🤝 <b>Referral Bonus per Valid User:</b> <b>" + pRef + " Credit</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⚡️ <b>Quick Commands Available:</b>\n" +
  "• <code>/set_price normal &lt;credits&gt;</code>\n" +
  "• <code>/set_price recovery &lt;credits&gt;</code>\n" +
  "• <code>/set_price 2fa &lt;credits&gt;</code>\n" +
  "• <code>/set_price custom &lt;credits&gt;</code>\n" +
  "• <code>/set_ref_reward &lt;credits&gt;</code>\n\n" +
  "👇 <i>Or tap a category below to adjust price:</i>";

var kbd = [
  [
    { text: "✏️ Set Normal (" + pNorm + " Cr)", callback_data: "/prompt_set_price normal" },
    { text: "✏️ Set Recovery (" + pRec + " Cr)", callback_data: "/prompt_set_price recovery" }
  ],
  [
    { text: "✏️ Set 2FA (" + p2FA + " Cr)", callback_data: "/prompt_set_price 2fa" },
    { text: "✏️ Set Custom (" + pCust + " Cr)", callback_data: "/prompt_set_price custom" }
  ],
  [
    { text: "🎁 Set Referral Bonus (" + pRef + " Cr)", callback_data: "/prompt_set_price ref" },
    { text: "🔄 Reset Defaults", callback_data: "/reset_prices" }
  ],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: priceText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
