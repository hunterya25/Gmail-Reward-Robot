/*CMD
  command: /balance
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 💰 Balance, Balance, 💰 balance
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// 🗑️ Delete previous bot message for a clean chat
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

var currentBalance = 0;
var totalRefs = 0;

try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    var balanceRes = Libs.ResourcesLib.userRes("balance");
    currentBalance = balanceRes ? balanceRes.value() : 0;
    var totalRefsRes = Libs.ResourcesLib.userRes("total_referrals");
    totalRefs = totalRefsRes ? totalRefsRes.value() : 0;
  } else {
    currentBalance = User.getProperty("balance") || 0;
    totalRefs = User.getProperty("total_referrals") || 0;
  }
} catch (e) {
  currentBalance = User.getProperty("balance") || 0;
  totalRefs = User.getProperty("total_referrals") || 0;
}

var isDuplicate = User.getProperty("is_duplicate");
var devStatus = isDuplicate ? "⚠️ Restricted (Duplicate Device)" : "✅ Active & Verified";

var myMails = User.getProperty("MyClaimedGmails");
var claimedCount = (myMails && Array.isArray(myMails)) ? myMails.length : 0;

var balanceText = "💳 <b>Your Account Overview</b> 💎\n\n" +
  "👤 <b>Account:</b> " + (user.first_name || "User") + " (<code>" + user.telegramid + "</code>)\n" +
  "🛡️ <b>Device Integrity:</b> <code>" + devStatus + "</code>\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "💰 <b>Available Balance:</b> <b>" + currentBalance + " Gmail Credit(s)</b>\n" +
  "👥 <b>Verified Referrals:</b> <b>" + totalRefs + " Friends</b>\n" +
  "📬 <b>Total Claimed Mails:</b> <b>" + claimedCount + " Accounts</b>\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "💡 <i>Tip: 1 Referral Credit = 1 Free Fresh Gmail Account!</i>";

var keyboard = [
  [{ text: "📧 Redeem Gmail (" + currentBalance + " Available)", callback_data: "/claim_mail" }],
  [{ text: "📜 My Claimed Mails (" + claimedCount + ")", callback_data: "/my_mails" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: balanceText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyboard },
  on_result: "/on_save_msg"
});
