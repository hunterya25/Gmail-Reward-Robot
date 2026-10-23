/*CMD
  command: /set_cat_state
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

var input = params ? params.trim().toLowerCase() : "";
if (!input && message) {
  input = message.replace("/set_cat_state", "").trim().toLowerCase();
}

var parts = input.split(" ");
if (parts.length < 2) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/set_cat_state normal|recovery|2fa on|off|private</code>", { parse_mode: "HTML" });
  return;
}

var targetCat = parts[0];
var targetState = parts[1].toUpperCase();

if (targetCat !== "normal" && targetCat !== "recovery" && targetCat !== "2fa") {
  Bot.sendMessage("❌ Unknown category. Must be: <code>normal</code>, <code>recovery</code>, or <code>2fa</code>", { parse_mode: "HTML" });
  return;
}

if (targetState !== "ON" && targetState !== "OFF" && targetState !== "PRIVATE") {
  Bot.sendMessage("❌ Unknown state. Must be: <code>ON</code>, <code>OFF</code>, or <code>PRIVATE</code>", { parse_mode: "HTML" });
  return;
}

Bot.setProperty("CategoryState_" + targetCat, targetState, "string");

var stateBadge = (targetState === "ON") ? "🟢 ON (Public & Purchasable)" :
  (targetState === "OFF" ? "⏸️ OFF (Disabled with notice)" : "👻 PRIVATE (Completely Hidden & Erased)");

var confirmMsg = "✅ <b>Category Visibility Updated!</b> 👁️\n\n" +
  "• Category: <b>" + targetCat.toUpperCase() + "</b>\n" +
  "• New Status: <b>" + stateBadge + "</b>\n\n" +
  (targetState === "PRIVATE" ? "<i>All buttons, text, and mentions of this category have been completely hidden from all users!</i>" :
   (targetState === "OFF" ? "<i>Users will see a 'Temporarily Disabled' notice when attempting to claim.</i>" : "<i>Users can view and purchase normally.</i>"));

var kbd = [
  [{ text: "📦 Return to Stock Division", callback_data: "/admin_stock" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: confirmMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
