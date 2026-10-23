/*CMD
  command: /rules
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: ℹ️ Rules & FAQ, Rules & FAQ, /faq, /help
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var guideText = "📖 <b>How @GmailRewardRobot Works & Official Rules</b> ⚡️\n\n" +
  "<b>1️⃣ How to Earn Free Gmail Accounts?</b>\n" +
  "• Tap <b>👥 Refer & Earn</b> to get your personal referral link.\n" +
  "• Share your link with real friends, groups, or social media.\n" +
  "• When a friend joins the official channel and passes the 2-second device audit, you receive <b>+1 Credit instantly</b>!\n\n" +
  "<b>2️⃣ What Accounts Can I Claim?</b>\n" +
  "• 🟢 <b>Normal Fresh:</b> Phone-verified Gmails ready for any app (1 Cr).\n" +
  "• 🛡️ <b>Recovery Attached:</b> Includes verified recovery mail (2 Cr).\n" +
  "• 🔐 <b>2FA Verified:</b> Pre-configured with two-factor security (3 Cr).\n" +
  "• 🎯 <b>Custom Order:</b> Pick your desired username, delivered in 1 hr (5 Cr).\n\n" +
  "<b>3️⃣ Strict Anti-Cheat Rules (Zero Tolerance):</b>\n" +
  "❌ No self-referrals or multi-accounts on the same physical phone or PC.\n" +
  "❌ No toggling flight mode / proxies to fake different IPs.\n" +
  "❌ Fake referrals result in 0 credits credited to the inviter.\n" +
  "✅ Only genuine, authentic devices count towards rewards!\n\n" +
  "<b>4️⃣ Channel Requirement:</b>\n" +
  "You must stay in our official announcement channel to maintain active status and claim accounts.";

var kbd = [
  [{ text: "⚡ Claim a Gmail", callback_data: "/getmail" }],
  [
    { text: "🤝 Refer Friends (+1 Cr)", callback_data: "/refer" },
    { text: "🏠 Main Menu", callback_data: "/start" }
  ]
];

Api.sendMessage({
  chat_id: chatId,
  text: guideText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});
