/*CMD
  command: /on_redeem_promo
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

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// Maintenance Mode Check
var adm = Bot.getProperty("adminID");
var isAdm = (adm && user && user.telegramid.toString() === adm.toString());
if (Bot.getProperty("maintenance_mode") && !isAdm) {
  Bot.sendMessage("🚧 <b>System Under Maintenance!</b> 🛠️\n\nOur engineers are upgrading the bot servers. Please check back shortly!", { parse_mode: "HTML" });
  return;
}

var inputCode = params ? params.trim().toUpperCase() : "";
if (!inputCode && message) {
  inputCode = message.trim().toUpperCase();
}

if (!inputCode || inputCode.indexOf("/") === 0) {
  // If user tapped a menu button or slash command
  return;
}

var promoList = Bot.getProperty("PromoCodesList") || [];
var promoObj = null;

for (var i = 0; i < promoList.length; i++) {
  if (promoList[i].code === inputCode) {
    promoObj = promoList[i];
    break;
  }
}

if (!promoObj) {
  Bot.sendMessage("❌ <b>Invalid Promo Code!</b> <code>" + inputCode + "</code> does not exist.\n\n<i>Please check spelling and try again.</i>", { parse_mode: "HTML" });
  return;
}

if (promoObj.status !== "Active") {
  Bot.sendMessage("⚠️ <b>Promo Code Inactive!</b> This promotion has been turned off by administration.", { parse_mode: "HTML" });
  return;
}

if (promoObj.used_count >= promoObj.max_users) {
  Bot.sendMessage("⚠️ <b>Redemption Limit Reached!</b> This promo code has reached its maximum quota of <b>" + promoObj.max_users + " users</b>.", { parse_mode: "HTML" });
  return;
}

if (!promoObj.users || !Array.isArray(promoObj.users)) {
  promoObj.users = [];
}

var uidStr = user.telegramid.toString();
if (promoObj.users.indexOf(uidStr) !== -1) {
  Bot.sendMessage("⚠️ <b>Already Redeemed!</b> You have already claimed credits from promo code <code>" + inputCode + "</code>.", { parse_mode: "HTML" });
  return;
}

// Credit user balance
var awardAmount = promoObj.amount || 1;
var newBalance = 0;

try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    var balRes = Libs.ResourcesLib.userRes("balance");
    balRes.add(awardAmount);
    newBalance = balRes.value();
  } else {
    var cur = User.getProperty("balance") || 0;
    newBalance = cur + awardAmount;
    User.setProperty("balance", newBalance, "integer");
  }
} catch (e) {
  var cur = User.getProperty("balance") || 0;
  newBalance = cur + awardAmount;
  User.setProperty("balance", newBalance, "integer");
}

// Update promo usage
promoObj.used_count = (promoObj.used_count || 0) + 1;
promoObj.users.push(uidStr);
Bot.setProperty("PromoCodesList", promoList, "json");

var successMsg = "🎉 <b>Promo Code Redeemed Successfully!</b> 🎁\n\n" +
  "• Code Applied: <code>" + inputCode + "</code>\n" +
  "• Bonus Credited: <b>+" + awardAmount + " Credits</b>\n" +
  "• Your New Balance: <b>" + newBalance + " Credits</b>\n\n" +
  "<i>You can use your credits immediately to claim Gmail accounts!</i>";

var kbd = [
  [{ text: "⚡ Claim a Gmail Now", callback_data: "/getmail" }],
  [{ text: "🏠 Main Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: successMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd },
  on_result: "/on_save_msg"
});
