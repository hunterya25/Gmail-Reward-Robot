/*CMD
  command: 📧 GetMail
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: GetMail, /getmail
  group: 
CMD*/

var balanceRes = Libs.ResourcesLib.userRes("balance");
var currentBalance = balanceRes ? balanceRes.value() : 0;

var gmailStock = Bot.getProperty("GmailStock", []);
var inStock = gmailStock ? gmailStock.length : 0;

var myMails = User.getProperty("MyClaimedGmails", []);
var claimedCount = myMails ? myMails.length : 0;

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
  text: mailText,
  parse_mode: "html",
  reply_markup: { inline_keyboard: keyboard }
});
