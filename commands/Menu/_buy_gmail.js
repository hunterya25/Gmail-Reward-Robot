/*CMD
  command: /buy_gmail
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

if (request && request.id) {
  try {
    Api.answerCallbackQuery({ callback_query_id: request.id, text: "🔄 Dispensing your account...", show_alert: false });
  } catch (e) {}
}

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

// 1. Channel Membership Gate
var isJoined = User.getProperty("channel_joined");
if (isJoined === false) {
  var targetChannel = Bot.getProperty("mandatory_channel", "@BotsByAntares");
  Api.sendMessage({
    chat_id: chatId,
    text: "⚠️ <b>Channel Membership Required!</b>\n\nYou must remain in <b>" + targetChannel + "</b> to claim accounts.\n\n👉 Join and verify below:",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📢 Join " + targetChannel, url: "https://t.me/" + targetChannel.replace("@", "") }],
        [{ text: "✅ Verify Membership", callback_data: "/check_join" }]
      ]
    },
    on_result: "/on_save_msg"
  });
  return;
}

// 2. Identify Category
var cat = params ? params.trim().toLowerCase() : "normal";
if (cat !== "normal" && cat !== "recovery" && cat !== "2fa") {
  cat = "normal";
}

var catTitles = {
  normal: "🟢 Normal Fresh Gmail",
  recovery: "🛡️ Recovery Attached Gmail",
  "2fa": "🔐 2-Step Verification (2FA) Gmail"
};

var catPrices = {
  normal: Bot.getProperty("Price_Normal") || 1,
  recovery: Bot.getProperty("Price_Recovery") || 2,
  "2fa": Bot.getProperty("Price_2FA") || 3
};

var price = catPrices[cat];
var catName = catTitles[cat];

// 3. Check Balance
var currentBalance = 0;
var balanceRes = null;
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    balanceRes = Libs.ResourcesLib.userRes("balance");
    currentBalance = balanceRes ? balanceRes.value() : 0;
  } else {
    currentBalance = User.getProperty("balance") || 0;
  }
} catch (e) {
  currentBalance = User.getProperty("balance") || 0;
}

if (currentBalance < price) {
  var needMoreText = "⚠️ <b>Insufficient Credits for " + catName + "!</b>\n\n" +
    "• Required: <b>" + price + " Credits</b>\n" +
    "• Your Balance: <b>" + currentBalance + " Credits</b>\n\n" +
    "👉 <i>Invite friends using your referral link to earn credits instantly!</i>";

  var kbd = [
    [{ text: "🤝 Invite Friends Now (+1 Cr)", callback_data: "/refer" }],
    [{ text: "🔙 Back to Store", callback_data: "/getmail" }]
  ];

  Api.sendMessage({
    chat_id: chatId,
    text: needMoreText,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: kbd },
    on_result: "/on_save_msg"
  });
  return;
}

// 4. Check Stock
var stockKey = "Stock_Normal";
if (cat === "recovery") stockKey = "Stock_Recovery";
if (cat === "2fa") stockKey = "Stock_2FA";

var stockArr = Bot.getProperty(stockKey);
if (!stockArr || !Array.isArray(stockArr) || stockArr.length === 0) {
  // If normal, also check legacy GmailStock
  if (cat === "normal") {
    var legacyStock = Bot.getProperty("GmailStock");
    if (legacyStock && Array.isArray(legacyStock) && legacyStock.length > 0) {
      stockArr = legacyStock;
      stockKey = "GmailStock";
    }
  }
}

if (!stockArr || !Array.isArray(stockArr) || stockArr.length === 0) {
  var adm = Bot.getProperty("adminID");
  if (adm) {
    Api.sendMessage({
      chat_id: adm,
      text: "🚨 <b>OUT OF STOCK ALERT!</b>\n\nCategory: <b>" + catName + "</b>\nUser: @" + (user.username || user.telegramid) + " tried to claim, but stock is empty!\n\n<i>Restock via /admin ➔ Stock Management.</i>",
      parse_mode: "HTML"
    });
  }

  Api.sendMessage({
    chat_id: chatId,
    text: "⚠️ <b>Out of Stock!</b>\n\nAll pre-loaded accounts in <b>" + catName + "</b> have been claimed.\n\n<i>Our administrators have been notified to restock. No credits were deducted!</i>",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔙 View Other Categories", callback_data: "/getmail" }]
      ]
    },
    on_result: "/on_save_msg"
  });
  return;
}

// 5. Dispense Account
var item = stockArr.shift();
Bot.setProperty(stockKey, stockArr, "json");

// Deduct credits
if (balanceRes && balanceRes.add) {
  balanceRes.add(-price);
} else {
  User.setProperty("balance", currentBalance - price, "integer");
}

var remBal = currentBalance - price;

// Track in user history
var nowTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
item.category = catName;
item.claimed_at = nowTime;

var userMails = User.getProperty("MyClaimedGmails");
if (!userMails || !Array.isArray(userMails)) { userMails = []; }
userMails.unshift(item);
User.setProperty("MyClaimedGmails", userMails, "json");

// Track in global stats
var totalClaimedGlobal = Bot.getProperty("TotalGmailsClaimedGlobal") || 0;
Bot.setProperty("TotalGmailsClaimedGlobal", totalClaimedGlobal + 1, "integer");

var extraInfo = "";
if (cat === "recovery") {
  extraInfo = "\n🛡️ <b>Recovery Email:</b>\n<code>" + (item.recovery || "Check inbox") + "</code>\n";
} else if (cat === "2fa") {
  extraInfo = "\n🔐 <b>2FA / Backup Keys:</b>\n<code>" + (item.two_factor || item.recovery || "2FA Enabled") + "</code>\n";
}

var dispenseSuccessText = "🎉 <b>Congratulations! Account Claimed</b> 📬\n\n" +
  "🏷️ <b>Category:</b> " + catName + "\n\n" +
  "📧 <b>Gmail Address:</b> (tap to copy)\n<code>" + item.email + "</code>\n\n" +
  "🔑 <b>Password:</b>\n<code>" + item.password + "</code>\n" +
  extraInfo + "\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⚠️ <b>Important Guidelines:</b>\n" +
  "• Log in promptly and secure the account.\n" +
  "• This account is 100% private and delivered only to you.\n\n" +
  "💰 <i>Remaining Balance: " + remBal + " Credits</i>";

var kbdSuccess = [
  [
    { text: "📜 My Claimed Mails", callback_data: "/my_mails" },
    { text: "➕ Claim Another", callback_data: "/getmail" }
  ],
  [{ text: "🏠 Main Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: dispenseSuccessText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbdSuccess },
  on_result: "/on_save_msg"
});
