/*CMD
  command: /promo
  help: 
  need_reply: true
  auto_retry_time: 
  folder: Menu

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 🎟️ Promo Code, Promo Code, /redeem_promo, 🎁 Promo Code, Promo, 🎟 Promo Code
  group: 
CMD*/

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// 1. Maintenance Mode Check
var adm = Bot.getProperty("adminID");
var isAdm = (adm && user && user.telegramid.toString() === adm.toString());
if (Bot.getProperty("maintenance_mode") && !isAdm) {
  Bot.sendMessage("🚧 <b>System Under Maintenance!</b> 🛠️\n\nOur engineers are upgrading the bot servers. Please check back shortly!", { parse_mode: "HTML" });
  return;
}

// 2. Determine User Input
var rawMsg = message ? message.trim() : "";
var codeInput = params ? params.trim().toUpperCase() : "";

if (!codeInput && rawMsg.indexOf("/promo ") === 0) {
  codeInput = rawMsg.replace("/promo ", "").trim().toUpperCase();
}

// Check if message is a button click or empty (not a promo code yet)
var isInitialPrompt = (!codeInput && (!rawMsg || rawMsg === "/promo" || rawMsg === "/redeem_promo" || rawMsg.indexOf("Promo Code") !== -1 || rawMsg.indexOf("🎟") !== -1 || rawMsg.indexOf("🎁") !== -1));

if (isInitialPrompt) {
  var promptText = "🎟️ <b>Redeem Promo Code</b> 🎁\n\n" +
    "🌟 <i>Have an official promotional gift code? Enter it below to claim instant bonus Gmail credits!</i>\n\n" +
    "👇 <b>Type or paste your promo code now:</b>";

  var kbd = [
    [{ text: "❌ Cancel", callback_data: "/start" }]
  ];

  Api.sendMessage({
    chat_id: chatId,
    text: promptText,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: kbd }
  });
  return;
}

// User sent an input code!
if (!codeInput) {
  codeInput = rawMsg.toUpperCase();
}

// Check if user tapped another menu button or command
if (codeInput.indexOf("/") === 0 || codeInput.indexOf("💰") === 0 || codeInput.indexOf("📧") === 0 || codeInput.indexOf("👥") === 0 || codeInput.indexOf("🎯") === 0 || codeInput.indexOf("📦") === 0 || codeInput.indexOf("🏆") === 0 || codeInput.indexOf("🛡") === 0 || codeInput.indexOf("💬") === 0 || codeInput.indexOf("ℹ") === 0) {
  return;
}

// Process Promo Code
var promoList = Bot.getProperty("PromoCodesList") || [];
var promoObj = null;

for (var i = 0; i < promoList.length; i++) {
  if (promoList[i].code === codeInput) {
    promoObj = promoList[i];
    break;
  }
}

if (!promoObj) {
  Bot.sendMessage("❌ <b>Invalid Promo Code!</b> <code>" + codeInput + "</code> does not exist.\n\n<i>Please check spelling and try again.</i>", { parse_mode: "HTML" });
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
  Bot.sendMessage("⚠️ <b>Already Redeemed!</b> You have already claimed credits from promo code <code>" + codeInput + "</code>.", { parse_mode: "HTML" });
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
  "• Code Applied: <code>" + codeInput + "</code>\n" +
  "• Bonus Credited: <b>+" + awardAmount + " Credits</b>\n" +
  "• Your New Balance: <b>" + newBalance + " Credits</b>\n\n" +
  "<i>You can use your credits immediately to claim Gmail accounts!</i>";

var successKbd = [
  [{ text: "⚡ Claim a Gmail Now", callback_data: "/getmail" }],
  [{ text: "🏠 Main Menu", callback_data: "/start" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: successMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: successKbd }
});
