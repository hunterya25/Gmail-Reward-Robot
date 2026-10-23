/*CMD
  command: /refer
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 👥 Refer & Earn, Refer Earn, Refer & Earn, 🤝 Refer & Earn, 👥 refer & earn
  group: 
CMD*/

var botUsername = "GmailRewardRobot";
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

var refLink = "https://t.me/" + botUsername + "?start=ref" + (user ? user.telegramid : "");

var currentBalance = 0;
var totalRefs = 0;

try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    var refRes = Libs.ResourcesLib.userRes("total_referrals");
    totalRefs = refRes ? refRes.value() : 0;
    var balanceRes = Libs.ResourcesLib.userRes("balance");
    currentBalance = balanceRes ? balanceRes.value() : 0;
  } else {
    currentBalance = User.getProperty("balance") || 0;
    totalRefs = User.getProperty("total_referrals") || 0;
  }
} catch (e) {
  currentBalance = User.getProperty("balance") || 0;
  totalRefs = User.getProperty("total_referrals") || 0;
}

var shareText = encodeURIComponent(
  "🎁 Get Free Fresh & Verified Gmail Accounts on Telegram!\n\n" +
  "Join @GmailRewardRobot and claim fresh Gmails simply by inviting friends.\n" +
  "👇 Start now:\n" + refLink
);

var referText = "👥 <b>Refer & Earn Free Gmail Accounts!</b> 💎\n\n" +
  "Invite friends to @GmailRewardRobot and receive <b>1 Fresh Gmail Credit</b> for every verified friend!\n\n" +
  "🔗 <b>Your Exclusive Referral Link:</b>\n" +
  "<code>" + refLink + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "📊 <b>Your Referral Performance:</b>\n" +
  "• 👥 <b>Verified Referrals:</b> <b>" + totalRefs + "</b>\n" +
  "• 💰 <b>Current Balance:</b> <b>" + currentBalance + " Credits</b>\n\n" +
  "🛡️ <b>Strict Anti-Fraud System:</b>\n" +
  "• 🚫 <i>Multi-accounting on the same device is strictly blocked.</i>\n" +
  "• 📱 <i>Each friend must complete the 2-3s device & IP integrity check.</i>\n" +
  "• ❌ <i>Duplicate devices give 0 referral credit. Only genuine friends count!</i>\n\n" +
  "👇 <i>Tap below to share your link with friends or groups:</i>";

var keyboard = [
  [{ text: "🚀 Share to Friends / Groups", url: "https://t.me/share/url?url=" + refLink + "&text=" + shareText }],
  [{ text: "📋 View My Referral History", callback_data: "/my_referrals" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: referText,
  parse_mode: "HTML",
  disable_web_page_preview: true,
  reply_markup: { inline_keyboard: keyboard },
  on_result: "/on_save_msg"
});
