/*CMD
  command: /claim_mail
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

if (request && request.id) {
  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text: "🔄 Processing Gmail request...",
    show_alert: false
  });
}

var balanceRes = Libs.ResourcesLib.userRes("balance");
var currentBalance = balanceRes ? balanceRes.value() : 0;

if (currentBalance < 1) {
  var needMoreText = "⚠️ <b>Insufficient Gmail Credits!</b>\n\n" +
    "You need at least <b>1 Credit</b> to claim a fresh Gmail account.\n\n" +
    "👉 Go to <b>👥 Refer & Earn</b> to invite real friends and earn credits instantly!";

  var kbd = [[{ text: "🤝 Invite Friends Now", callback_data: "/refer" }]];
  Api.sendMessage({
    text: needMoreText,
    parse_mode: "html",
    reply_markup: { inline_keyboard: kbd }
  });
  return;
}

var gmailStock = Bot.getProperty("GmailStock", []);
if (!gmailStock || gmailStock.length === 0) {
  var adm = Bot.getProperty("adminID");
  if (adm) {
    Api.sendMessage({
      chat_id: adm,
      text: "🚨 <b>ALERT: Gmail Stock Depleted!</b>\n\nUser @" + (user.username || user.telegramid) + " tried to claim a Gmail, but stock is empty!\n\n_Use /add_gmail in Admin Panel to upload new accounts._",
      parse_mode: "html"
    });
  }

  Api.sendMessage({
    text: "⚠️ <b>Stock Currently Depleted!</b>\n\nAll pre-loaded Gmail accounts have been claimed. Our administrators have been alerted to restock immediately.\n\n<i>Note: No credits were deducted from your balance. Please try claiming again shortly!</i>",
    parse_mode: "html"
  });
  return;
}

// Dispense 1 Gmail from stock
var claimedItem = gmailStock.shift();
Bot.setProperty("GmailStock", gmailStock, "json");

// Deduct 1 credit
balanceRes.add(-1);

// Save to user claimed list
var nowTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
claimedItem.claimed_at = nowTime;

var userMails = User.getProperty("MyClaimedGmails", []);
if (!userMails) { userMails = []; }
userMails.unshift(claimedItem);
User.setProperty("MyClaimedGmails", userMails, "json");

var successDispenseText = "🎉 <b>Congratulations! Fresh Gmail Claimed</b> 📬\n\n" +
  "Here are your account credentials (tap to copy):\n\n" +
  "📧 <b>Email:</b>\n<code>" + claimedItem.email + "</code>\n\n" +
  "🔑 <b>Password:</b>\n<code>" + claimedItem.password + "</code>\n\n" +
  "🛡️ <b>Recovery Info:</b>\n<code>" + (claimedItem.recovery || "Self-Recovery") + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "⚠️ <b>Security Notice:</b>\n" +
  "• Please log in immediately and update password / recovery details.\n" +
  "• This account is now exclusively yours.\n\n" +
  "💰 <i>Remaining Balance: " + balanceRes.value() + " Credits</i>";

var kbd = [
  [{ text: "📜 My Claimed Mails", callback_data: "/my_mails" }],
  [{ text: "➕ Claim Another", callback_data: "/claim_mail" }]
];

Api.sendMessage({
  text: successDispenseText,
  parse_mode: "html",
  reply_markup: { inline_keyboard: kbd }
});
