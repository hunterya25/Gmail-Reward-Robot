/*CMD
  command: /admin_stock
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

var stockNorm = Bot.getProperty("Stock_Normal") || Bot.getProperty("GmailStock") || [];
var stockRec = Bot.getProperty("Stock_Recovery") || [];
var stock2FA = Bot.getProperty("Stock_2FA") || [];
var totalStock = stockNorm.length + stockRec.length + stock2FA.length;

var stateNorm = Bot.getProperty("CategoryState_normal") || "ON";
var stateRec = Bot.getProperty("CategoryState_recovery") || "ON";
var state2FA = Bot.getProperty("CategoryState_2fa") || "ON";

function formatStateBadge(st) {
  if (st === "OFF") return "⏸️ OFF (Disabled)";
  if (st === "PRIVATE") return "👻 PRIVATE (Hidden)";
  return "🟢 ON (Public)";
}

var stockText = "📦 <b>Stock & Category Visibility Control Division</b> ⚡️\n\n" +
  "• 🟢 <b>Normal Fresh:</b> <b>" + stockNorm.length + " In Stock</b> | <code>" + formatStateBadge(stateNorm) + "</code>\n" +
  "• 🛡️ <b>Recovery Attached:</b> <b>" + stockRec.length + " In Stock</b> | <code>" + formatStateBadge(stateRec) + "</code>\n" +
  "• 🔐 <b>2-Step Verification:</b> <b>" + stock2FA.length + " In Stock</b> | <code>" + formatStateBadge(state2FA) + "</code>\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "📊 <b>Total Pooled Stock:</b> <b>" + totalStock + " Accounts</b>\n\n" +
  "💡 <i>Category Status Guide:</i>\n" +
  "• <b>ON:</b> Normal public view & claims.\n" +
  "• <b>OFF:</b> Shows 'Temporarily Disabled' notice on click.\n" +
  "• <b>PRIVATE:</b> Completely hidden from all users (zero clue/trace)!\n\n" +
  "👇 <i>Tap buttons below to toggle state or upload stock:</i>";

var kbd = [
  // Normal State Row
  [
    { text: (stateNorm === "ON" ? "🟢 Normal: ON ✓" : "🟢 Set Normal ON"), callback_data: "/set_cat_state normal on" },
    { text: (stateNorm === "OFF" ? "⏸️ OFF ✓" : "⏸️ OFF"), callback_data: "/set_cat_state normal off" },
    { text: (stateNorm === "PRIVATE" ? "👻 PRIVATE ✓" : "👻 PRIVATE"), callback_data: "/set_cat_state normal private" }
  ],
  // Recovery State Row
  [
    { text: (stateRec === "ON" ? "🛡️ Recovery: ON ✓" : "🛡️ Set Rec ON"), callback_data: "/set_cat_state recovery on" },
    { text: (stateRec === "OFF" ? "⏸️ OFF ✓" : "⏸️ OFF"), callback_data: "/set_cat_state recovery off" },
    { text: (stateRec === "PRIVATE" ? "👻 PRIVATE ✓" : "👻 PRIVATE"), callback_data: "/set_cat_state recovery private" }
  ],
  // 2FA State Row
  [
    { text: (state2FA === "ON" ? "🔐 2FA: ON ✓" : "🔐 Set 2FA ON"), callback_data: "/set_cat_state 2fa on" },
    { text: (state2FA === "OFF" ? "⏸️ OFF ✓" : "⏸️ OFF"), callback_data: "/set_cat_state 2fa off" },
    { text: (state2FA === "PRIVATE" ? "👻 PRIVATE ✓" : "👻 PRIVATE"), callback_data: "/set_cat_state 2fa private" }
  ],
  // Stock Upload Rows
  [
    { text: "🟢 Add Normal", callback_data: "/prompt_add_normal" },
    { text: "🛡️ Add Recovery", callback_data: "/prompt_add_recovery" },
    { text: "🔐 Add 2FA", callback_data: "/prompt_add_2fa" }
  ],
  [
    { text: "📦 Inspect Inventory (" + totalStock + ")", callback_data: "/stock" },
    { text: "🧹 Wipe Stock", callback_data: "/prompt_wipe_stock" }
  ],
  [{ text: "🔙 Back to Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: stockText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
