/*CMD
  command: /leaderboard
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 🏆 Leaderboard, Leaderboard
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var allUsers = Bot.getProperty("all_bot_users") || [];
var userStats = [];

for (var i = 0; i < allUsers.length; i++) {
  var uid = allUsers[i];
  var refCount = Bot.getProperty("total_referrals_" + uid) || 0;
  if (refCount > 0) {
    userStats.push({ id: uid, refs: parseInt(refCount) });
  }
}

userStats.sort(function(a, b) {
  return b.refs - a.refs;
});

var medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
var leadText = "🏆 <b>Top Referrers Hall of Fame</b> 🌟\n\n" +
  "<i>Recognizing the top members who invited authentic, unique devices:</i>\n\n";

if (userStats.length === 0) {
  leadText += "<i>No referrals registered yet. Be the first to reach the leaderboard!</i>\n\n";
} else {
  for (var j = 0; j < Math.min(userStats.length, 10); j++) {
    var u = userStats[j];
    var medal = medals[j] || "🎖️";
    leadText += medal + " <b>Member:</b> <code>" + u.id.toString().substring(0, 4) + "••••" + u.id.toString().slice(-2) + "</code> — <b>" + u.refs + " Referrals</b>\n";
  }
  leadText += "\n";
}

leadText += "━━━━━━━━━━━━━━━━━━━━\n" +
  "🎁 <i>Top referrers receive bonus Gmail credits and priority support!</i>\n\n" +
  "👇 <i>Share your link to climb the leaderboard:</i>";

var kbd = [
  [{ text: "🤝 Share My Referral Link", callback_data: "/refer" }],
  [{ text: "🏠 Main Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: leadText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});
