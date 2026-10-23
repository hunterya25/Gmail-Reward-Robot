/*CMD
  command: /inspect_refs
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

var targetInput = params ? params.trim() : "";
if (!targetInput && message) {
  targetInput = message.replace("/inspect_refs", "").trim();
}

if (!targetInput) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/inspect_refs &lt;USER_TELEGRAM_ID&gt;</code>", { parse_mode: "HTML" });
  return;
}

var targetId = targetInput;
var refList = Bot.getProperty("UserReferrals_" + targetId) || [];

var msg = "👥 <b>Referral Ledger for User:</b> <code>" + targetId + "</code> (" + refList.length + " Total)\n\n";

if (refList.length === 0) {
  msg += "<i>No referrals recorded for this user.</i>\n";
} else {
  for (var i = 0; i < Math.min(refList.length, 10); i++) {
    var r = refList[i];
    msg += (i + 1) + ". " + (r.name || "Member") + " (<code>" + r.id + "</code>)\n" +
      "📱 Dev: <code>" + (r.device_id ? r.device_id.substring(0, 16) : "N/A") + "...</code>\n" +
      "📅 Time: " + (r.time || "N/A") + "\n\n";
  }
}

var kbd = [
  [{ text: "👤 Inspect User Profile", callback_data: "/user_info " + targetId }],
  [{ text: "🔙 Back to Referrals Division", callback_data: "/admin_refers" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
