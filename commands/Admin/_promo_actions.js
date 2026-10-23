/*CMD
  command: /create_promo
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /toggle_promo, /edit_promo, /del_promo, /promo_list
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var cmd = message ? message.split(" ")[0].toLowerCase() : "/create_promo";
var input = params ? params.trim() : "";
if (!input && message) {
  input = message.replace(cmd, "").trim();
}

var promoList = Bot.getProperty("PromoCodesList") || [];

if (cmd === "/promo_list") {
  Bot.runCommand("/admin_promos");
  return;
}

if (cmd === "/del_promo") {
  var targetCode = input.toUpperCase().trim();
  if (!targetCode) {
    Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/del_promo &lt;CODE&gt;</code>", { parse_mode: "HTML" });
    return;
  }

  var foundIdx = -1;
  for (var i = 0; i < promoList.length; i++) {
    if (promoList[i].code === targetCode) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx === -1) {
    Bot.sendMessage("❌ Promo code <code>" + targetCode + "</code> not found.", { parse_mode: "HTML" });
    return;
  }

  promoList.splice(foundIdx, 1);
  Bot.setProperty("PromoCodesList", promoList, "json");
  Bot.sendMessage("✅ <b>Promo Code Deleted!</b> <code>" + targetCode + "</code> was removed.", { parse_mode: "HTML" });
  return;
}

if (cmd === "/toggle_promo") {
  var targetCode = input.toUpperCase().trim();
  if (!targetCode) {
    Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/toggle_promo &lt;CODE&gt;</code>", { parse_mode: "HTML" });
    return;
  }

  var promoObj = null;
  for (var j = 0; j < promoList.length; j++) {
    if (promoList[j].code === targetCode) {
      promoObj = promoList[j];
      break;
    }
  }

  if (!promoObj) {
    Bot.sendMessage("❌ Promo code <code>" + targetCode + "</code> not found.", { parse_mode: "HTML" });
    return;
  }

  promoObj.status = (promoObj.status === "Active") ? "Disabled" : "Active";
  Bot.setProperty("PromoCodesList", promoList, "json");
  Bot.sendMessage("✅ <b>Promo Code Status Toggled:</b> <code>" + targetCode + "</code> is now <b>" + promoObj.status + "</b>", { parse_mode: "HTML" });
  return;
}

if (cmd === "/edit_promo") {
  var parts = input.split(" ");
  if (parts.length < 3) {
    Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/edit_promo &lt;CODE&gt; &lt;NEW_AMOUNT&gt; &lt;NEW_MAX_USERS&gt;</code>", { parse_mode: "HTML" });
    return;
  }

  var code = parts[0].toUpperCase().trim();
  var newAmt = parseFloat(parts[1]);
  var newMax = parseInt(parts[2]);

  if (isNaN(newAmt) || isNaN(newMax)) {
    Bot.sendMessage("❌ Invalid numbers for amount or max users.", { parse_mode: "HTML" });
    return;
  }

  var editObj = null;
  for (var k = 0; k < promoList.length; k++) {
    if (promoList[k].code === code) {
      editObj = promoList[k];
      break;
    }
  }

  if (!editObj) {
    Bot.sendMessage("❌ Promo code <code>" + code + "</code> not found.", { parse_mode: "HTML" });
    return;
  }

  editObj.amount = newAmt;
  editObj.max_users = newMax;
  Bot.setProperty("PromoCodesList", promoList, "json");
  Bot.sendMessage("✅ <b>Promo Code Edited!</b> <code>" + code + "</code>: <b>+" + newAmt + " Credits</b> | <b>Max " + newMax + " Users</b>", { parse_mode: "HTML" });
  return;
}

// /create_promo
var cParts = input.split(" ");
if (cParts.length < 3) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/create_promo &lt;CODE&gt; &lt;AMOUNT&gt; &lt;MAX_USERS&gt;</code>\n\n<i>Example:</i> <code>/create_promo GIFT2 2 50</code>", { parse_mode: "HTML" });
  return;
}

var pCode = cParts[0].toUpperCase().trim();
var pAmt = parseFloat(cParts[1]);
var pMax = parseInt(cParts[2]);

if (isNaN(pAmt) || pAmt <= 0 || isNaN(pMax) || pMax <= 0) {
  Bot.sendMessage("❌ Invalid amount or max users. Both must be positive numbers.", { parse_mode: "HTML" });
  return;
}

// Check duplicate code
for (var m = 0; m < promoList.length; m++) {
  if (promoList[m].code === pCode) {
    Bot.sendMessage("⚠️ A promo code with name <code>" + pCode + "</code> already exists!", { parse_mode: "HTML" });
    return;
  }
}

var nowTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

promoList.unshift({
  code: pCode,
  amount: pAmt,
  max_users: pMax,
  used_count: 0,
  status: "Active",
  created_at: nowTime,
  users: []
});

Bot.setProperty("PromoCodesList", promoList, "json");

var createdText = "🎉 <b>Promo Code Created Successfully!</b> 🎟️\n\n" +
  "• <b>Code:</b> <code>" + pCode + "</code>\n" +
  "• <b>Reward:</b> <b>+" + pAmt + " Credits</b>\n" +
  "• <b>Max Users:</b> <b>" + pMax + " Redemptions</b>\n" +
  "• <b>Created:</b> <i>" + nowTime + "</i>\n" +
  "• <b>Status:</b> 🟢 Active\n\n" +
  "<i>Users can redeem by tapping '🎟️ Promo Code' in the menu or sending /promo " + pCode + "</i>";

var kbd = [
  [{ text: "🎟️ Manage All Promos", callback_data: "/admin_promos" }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: createdText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
