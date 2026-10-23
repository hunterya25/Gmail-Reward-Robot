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
var currentBalance = 0;

try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    var balanceRes = Libs.ResourcesLib.userRes("balance");
    currentBalance = balanceRes ? balanceRes.value() : 0;
  } else {
    currentBalance = User.getProperty("balance") || 0;
  }
} catch (e) {
  currentBalance = User.getProperty("balance") || 0;
}

var gmailStock = Bot.getProperty("GmailStock");
var inStock = (gmailStock && Array.isArray(gmailStock)) ? gmailStock.length : 0;

var myMails = User.getProperty("MyClaimedGmails");
var claimedCount = (myMails && Array.isArray(myMails)) ? myMails.length : 0;

var mailText = "📧 <b>Instant Gmail Dispenser</b> ⚡️\n\n" +
  "🌟 <i>Claim 100% Fresh, Phone-Verified & High-Quality Gmail Accounts!</i>\n\n" +
  "📊 <b>Market Status:</b>\n" +
  "• 📦 <b>Available Stock:</b> <b>" + inStock + " Gmails</b>\n" +
  "• 🏷️ <b>Price:</b> <b>1 Credit per Gmail</b>\n" +
  "• 💰 <b>Your Available Credits:</b> <b>" + currentBalance + " Credits</b>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "💡 <b>How to get more credits?</b>\n" +
  "Go to <b>👥 Refer & Earn</b> and invite your friends. Each unique device that verifies gives you +1 Credit instantly!";

var keyboard = [];

if (currentBalance >= 1) {
  keyboard.push([{ text: "⚡ Claim 1 Fresh Gmail Now", callback_data: "/claim_mail" }]);
} else {
  keyboard.push([{ text: "🤝 Invite Friends to Earn Credits", callback_data: "/refer" }]);
}

keyboard.push([{ text: "📜 View My Claimed Accounts (" + claimedCount + ")", callback_data: "/my_mails" }]);

Api.sendMessage({
  chat_id: chatId,
  text: mailText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyboard }
});
