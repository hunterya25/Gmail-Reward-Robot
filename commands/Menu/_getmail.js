/*CMD
  command: /getmail
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 📧 GetMail, GetMail, 📧 getmail
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// 0. Maintenance Mode Check
var adm = Bot.getProperty("adminID");
var isAdm = (adm && user && user.telegramid.toString() === adm.toString());
if (Bot.getProperty("maintenance_mode") && !isAdm) {
  Bot.sendMessage("🚧 <b>System Under Maintenance!</b> 🛠️\n\nOur engineers are upgrading the bot servers. Please check back shortly!", { parse_mode: "HTML" });
  return;
}

// 🗑️ Delete previous bot message for a clean chat interface
var lastBotMsg = User.getProperty("last_bot_msg_id");
if (lastBotMsg) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: lastBotMsg });
  } catch (e) {}
  User.setProperty("last_bot_msg_id", null);
}

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

// 📢 Channel Membership Gate
var isJoined = User.getProperty("channel_joined");
if (isJoined === false) {
  var chs = Bot.getProperty("mandatory_channels");
  if (!chs || !Array.isArray(chs) || chs.length === 0) {
    chs = [Bot.getProperty("mandatory_channel", "@BotsByAntares")];
  }
  var kbdGate = [];
  var failGateText = "⚠️ <b>Channel Membership Required!</b>\n\nYou must join all official channels to access the Gmail store:\n\n";
  for (var i = 0; i < chs.length; i++) {
    var cUrl = "https://t.me/" + chs[i].replace("@", "");
    failGateText += (i + 1) + ". <a href='" + cUrl + "'>" + chs[i] + "</a>\n";
    kbdGate.push([{ text: "📢 Join " + chs[i], url: cUrl }]);
  }
  kbdGate.push([{ text: "✅ Verify All Memberships", callback_data: "/check_join" }]);

  Api.sendMessage({
    chat_id: chatId,
    text: failGateText,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: kbdGate },
    on_result: "/on_save_msg"
  });
  return;
}

// Fetch user balance safely
var currentBalance = 0;
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    currentBalance = Libs.ResourcesLib.userRes("balance").value();
  } else {
    currentBalance = User.getProperty("balance") || 0;
  }
} catch (e) {
  currentBalance = User.getProperty("balance") || 0;
}

// Fetch Prices
var priceNormal = Bot.getProperty("Price_Normal") || 1;
var priceRecovery = Bot.getProperty("Price_Recovery") || 2;
var price2FA = Bot.getProperty("Price_2FA") || 3;
var priceCustom = Bot.getProperty("Price_Custom") || 5;

// Fetch Category States (ON / OFF / PRIVATE)
var stateNorm = Bot.getProperty("CategoryState_normal") || "ON";
var stateRec = Bot.getProperty("CategoryState_recovery") || "ON";
var state2FA = Bot.getProperty("CategoryState_2fa") || "ON";
var stateCustom = Bot.getProperty("CategoryState_custom") || "ON";

// Fetch Stocks
var stockNormalArr = Bot.getProperty("Stock_Normal") || Bot.getProperty("GmailStock") || [];
var stockRecoveryArr = Bot.getProperty("Stock_Recovery") || [];
var stock2FAArr = Bot.getProperty("Stock_2FA") || [];

var countNormal = stockNormalArr.length;
var countRecovery = stockRecoveryArr.length;
var count2FA = stock2FAArr.length;

// Total stock includes only non-private categories
var totalStock = 0;
if (stateNorm !== "PRIVATE") totalStock += countNormal;
if (stateRec !== "PRIVATE") totalStock += countRecovery;
if (state2FA !== "PRIVATE") totalStock += count2FA;

var dispenserText = "📬 <b>Gmail Store & Instant Dispenser</b> ⚡️\n\n" +
  "🌟 <i>Claim 100% genuine, phone-verified Google accounts ready to use.</i>\n\n" +
  "💰 <b>Your Available Balance:</b> <b>" + currentBalance + " Credits</b>\n" +
  "📦 <b>Total Live Inventory:</b> <b>" + totalStock + " Accounts</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "<b>Available Categories:</b>\n\n";

var keyboard = [];

// 1. Normal Category
if (stateNorm !== "PRIVATE") {
  if (stateNorm === "ON") {
    dispenserText += "🟢 <b>Normal Fresh Gmail</b>\n" +
      "• Rate: <b>" + priceNormal + " Credit</b> | In Stock: <code>" + countNormal + "</code>\n" +
      "• Clean fresh mail, phone verified, ready to log in.\n\n";
    keyboard.push([{ text: "🟢 Normal Mail (" + countNormal + ") — " + priceNormal + " Cr", callback_data: "/buy_gmail normal" }]);
  } else {
    // OFF
    dispenserText += "🟢 <b>Normal Fresh Gmail</b>\n" +
      "• Status: <i>⚠️ Temporarily Disabled</i>\n\n";
    keyboard.push([{ text: "⏸️ Normal Mail — Temp Disabled", callback_data: "/cat_disabled normal" }]);
  }
}

// 2. Recovery Category
if (stateRec !== "PRIVATE") {
  if (stateRec === "ON") {
    dispenserText += "🛡️ <b>Recovery Attached Gmail</b>\n" +
      "• Rate: <b>" + priceRecovery + " Credits</b> | In Stock: <code>" + countRecovery + "</code>\n" +
      "• Pre-secured with recovery email attached.\n\n";
    keyboard.push([{ text: "🛡️ Recovery Mail (" + countRecovery + ") — " + priceRecovery + " Cr", callback_data: "/buy_gmail recovery" }]);
  } else {
    // OFF
    dispenserText += "🛡️ <b>Recovery Attached Gmail</b>\n" +
      "• Status: <i>⚠️ Temporarily Disabled</i>\n\n";
    keyboard.push([{ text: "⏸️ Recovery Mail — Temp Disabled", callback_data: "/cat_disabled recovery" }]);
  }
}

// 3. 2FA Category
if (state2FA !== "PRIVATE") {
  if (state2FA === "ON") {
    dispenserText += "🔐 <b>2-Step Verification (2FA) Gmail</b>\n" +
      "• Rate: <b>" + price2FA + " Credits</b> | In Stock: <code>" + count2FA + "</code>\n" +
      "• Ultra-secure accounts with 2FA / backup codes.\n\n";
    keyboard.push([{ text: "🔐 2FA Mail (" + count2FA + ") — " + price2FA + " Cr", callback_data: "/buy_gmail 2fa" }]);
  } else {
    // OFF
    dispenserText += "🔐 <b>2-Step Verification (2FA) Gmail</b>\n" +
      "• Status: <i>⚠️ Temporarily Disabled</i>\n\n";
    keyboard.push([{ text: "⏸️ 2FA Mail — Temp Disabled", callback_data: "/cat_disabled 2fa" }]);
  }
}

// 4. Custom Gmail Order
if (stateCustom !== "PRIVATE") {
  if (stateCustom === "ON") {
    dispenserText += "🎯 <b>Custom Gmail Order</b>\n" +
      "• Rate: <b>" + priceCustom + " Credits</b> | Turnaround: <b>Within 1 Hour</b>\n" +
      "• Choose your own custom name, username, 2FA & app password!\n\n";
    keyboard.push([{ text: "🎯 Order Custom Gmail (" + priceCustom + " Cr)", callback_data: "/order_custom" }]);
  } else {
    // OFF
    dispenserText += "🎯 <b>Custom Gmail Order</b>\n" +
      "• Status: <i>⚠️ Temporarily Disabled</i>\n\n";
    keyboard.push([{ text: "⏸️ Custom Order — Temp Disabled", callback_data: "/cat_disabled custom" }]);
  }
}

dispenserText += "👇 <b>Select an option below to claim or order:</b>";

keyboard.push([
  { text: "📜 My Claimed Mails", callback_data: "/my_mails" },
  { text: "🤝 Refer Friends (+1 Cr)", callback_data: "/refer" }
]);

Api.sendMessage({
  chat_id: chatId,
  text: dispenserText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyboard },
  on_result: "/on_save_msg"
});
