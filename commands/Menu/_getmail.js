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

// 📢 Real-Time Channel Membership Check
var targetChannel = Bot.getProperty("mandatory_channel", "@BotsByAntares");
var isJoined = User.getProperty("channel_joined");
if (isJoined === false) {
  var channelUrl = "https://t.me/" + targetChannel.replace("@", "");
  Api.sendMessage({
    chat_id: chatId,
    text: "⚠️ <b>Channel Membership Required!</b>\n\nYou must be in <b>" + targetChannel + "</b> to access the Gmail store!\n\n👇 <i>Please join and verify below:</i>",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Join " + targetChannel, url: channelUrl }],
        [{ text: "✅ Verify Membership", callback_data: "/check_join" }]
      ]
    },
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

// Fetch Stocks
var stockNormalArr = Bot.getProperty("Stock_Normal");
if (!stockNormalArr || !Array.isArray(stockNormalArr)) {
  // Legacy fallback to GmailStock
  stockNormalArr = Bot.getProperty("GmailStock") || [];
}
var stockRecoveryArr = Bot.getProperty("Stock_Recovery") || [];
var stock2FAArr = Bot.getProperty("Stock_2FA") || [];

var countNormal = stockNormalArr.length;
var countRecovery = stockRecoveryArr.length;
var count2FA = stock2FAArr.length;
var totalStock = countNormal + countRecovery + count2FA;

var dispenserText = "📬 <b>Gmail Store & Instant Dispenser</b> ⚡️\n\n" +
  "🌟 <i>Claim 100% genuine, phone-verified Google accounts ready to use.</i>\n\n" +
  "💰 <b>Your Available Balance:</b> <b>" + currentBalance + " Credits</b>\n" +
  "📦 <b>Total Live Inventory:</b> <b>" + totalStock + " Accounts</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "<b>Available Categories:</b>\n\n" +
  "1️⃣ 🟢 <b>Normal Fresh Gmail</b>\n" +
  "• Rate: <b>" + priceNormal + " Credit</b> | In Stock: <code>" + countNormal + "</code>\n" +
  "• Clean fresh mail, phone verified, ready to log in.\n\n" +
  "2️⃣ 🛡️ <b>Recovery Attached Gmail</b>\n" +
  "• Rate: <b>" + priceRecovery + " Credits</b> | In Stock: <code>" + countRecovery + "</code>\n" +
  "• Pre-secured with recovery email attached.\n\n" +
  "3️⃣ 🔐 <b>2-Step Verification (2FA) Gmail</b>\n" +
  "• Rate: <b>" + price2FA + " Credits</b> | In Stock: <code>" + count2FA + "</code>\n" +
  "• Ultra-secure accounts with 2FA / backup codes.\n\n" +
  "4️⃣ 🎯 <b>Custom Gmail Order</b>\n" +
  "• Rate: <b>" + priceCustom + " Credits</b> | Turnaround: <b>Within 1 Hour</b>\n" +
  "• Choose your own custom name, username & recovery info!\n\n" +
  "👇 <b>Select a category below to claim or order:</b>";

var keyboard = [
  [{ text: "🟢 Normal Mail (" + countNormal + ") — " + priceNormal + " Cr", callback_data: "/buy_gmail normal" }],
  [{ text: "🛡️ Recovery Mail (" + countRecovery + ") — " + priceRecovery + " Cr", callback_data: "/buy_gmail recovery" }],
  [{ text: "🔐 2FA Mail (" + count2FA + ") — " + price2FA + " Cr", callback_data: "/buy_gmail 2fa" }],
  [{ text: "🎯 Order Custom Gmail (" + priceCustom + " Cr)", callback_data: "/order_custom" }],
  [
    { text: "📜 My Claimed Mails", callback_data: "/my_mails" },
    { text: "🤝 Refer Friends (+1 Cr)", callback_data: "/refer" }
  ]
];

Api.sendMessage({
  chat_id: chatId,
  text: dispenserText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyboard },
  on_result: "/on_save_msg"
});
