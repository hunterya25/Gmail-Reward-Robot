/*CMD
  command: /top_referrers
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var allUsers = Bot.getProperty("all_bot_users") || [];
var stats = [];

for (var i = 0; i < allUsers.length; i++) {
  var uid = allUsers[i];
  var count = Bot.getProperty("total_referrals_" + uid) || 0;
  if (count > 0) {
    stats.push({ id: uid, count: parseInt(count) });
  }
}

stats.sort(function(a, b) { return b.count - a.count; });

var msg = "🏆 <b>Top Referrers Detailed Ledger</b> 📊\n\n";

if (stats.length === 0) {
  msg += "<i>No referrals registered yet across the platform.</i>\n";
} else {
  for (var j = 0; j < Math.min(stats.length, 15); j++) {
    var item = stats[j];
    msg += (j + 1) + ". <code>" + item.id + "</code> — <b>" + item.count + " Referrals</b> (<code>/inspect_refs " + item.id + "</code>)\n";
  }
}

var kbd = [
  [{ text: "🤝 Referrals Division", callback_data: "/admin_refers" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
