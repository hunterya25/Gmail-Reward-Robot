/*CMD
  command: /user_info
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
  targetInput = message.replace("/user_info", "").trim();
}

if (!targetInput) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/user_info &lt;TELEGRAM_USER_ID&gt;</code>", { parse_mode: "HTML" });
  return;
}

var targetId = targetInput;

var uBal = 0;
try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    uBal = Libs.ResourcesLib.anotherUserRes("balance", targetId).value();
  } else {
    uBal = Bot.getProperty("balance_" + targetId) || 0;
  }
} catch (e) {
  uBal = Bot.getProperty("balance_" + targetId) || 0;
}

var uRefs = Bot.getProperty("total_referrals_" + targetId) || 0;
var uDev = Bot.getProperty("UserDevice_" + targetId) || "Not Detected / Cleared";
var uIp = Bot.getProperty("UserIp_" + targetId) || "Not Detected";
var isBanned = Bot.getProperty("ban_" + targetId) ? "⛔ BANNED" : "✅ ACTIVE";

var profileText = "👤 <b>User Deep Profile Inspection</b> 🔍\n\n" +
  "• 🆔 <b>Telegram ID:</b> <code>" + targetId + "</code>\n" +
  "• 🔒 <b>Account Status:</b> " + isBanned + "\n" +
  "• 💰 <b>Current Balance:</b> <b>" + uBal + " Credits</b>\n" +
  "• 👥 <b>Verified Referrals:</b> <b>" + uRefs + "</b>\n" +
  "• 📱 <b>Hardware Device:</b>\n<code>" + uDev + "</code>\n" +
  "• 🌐 <b>Registered IP:</b> <code>" + uIp + "</code>\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "👇 <i>Quick administration actions for this user:</i>";

var kbd = [
  [
    { text: "➕ Add Balance", callback_data: "/add_bal " + targetId + " 1" },
    { text: "➖ Cut Balance", callback_data: "/cut_bal " + targetId + " 1" }
  ],
  [
    { text: "📱 Reset Device", callback_data: "/clear_device " + targetId },
    { text: "⛔ Ban / Unban", callback_data: "/ban " + targetId }
  ],
  [{ text: "🔙 Back to Users Division", callback_data: "/admin_users" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: profileText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
