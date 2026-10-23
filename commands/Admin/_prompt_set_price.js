/*CMD
  command: /prompt_set_price
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

var chatId = (chat && chat.chatid) ? chat.chatid : user.telegramid;

var rawInput = params ? params.trim() : "";
if (!rawInput && message) {
  rawInput = message.replace("/prompt_set_price", "").trim();
}

var parts = rawInput.split(" ");
var action = parts[0] ? parts[0].toLowerCase() : "";

// Helper mapping
function getCatInfo(cat) {
  if (cat === "normal") {
    return { name: "Normal Fresh Gmail 🟢", prop: "Price_Normal", def: 1 };
  } else if (cat === "recovery") {
    return { name: "Recovery Attached Gmail 🛡️", prop: "Price_Recovery", def: 2 };
  } else if (cat === "2fa") {
    return { name: "2-Step Verification (2FA) 🔐", prop: "Price_2FA", def: 3 };
  } else if (cat === "custom") {
    return { name: "Custom Order Gmail 🎯", prop: "Price_Custom", def: 5 };
  } else if (cat === "ref") {
    return { name: "Referral Bonus per Valid User 🎁", prop: "Ref_Reward_Amount", def: 1 };
  }
  return null;
}

// 1. Handle SET action: /prompt_set_price set <cat> <value>
if (action === "set") {
  var sCat = parts[1] ? parts[1].toLowerCase() : "";
  var sVal = parseInt(parts[2]);
  var cInfo = getCatInfo(sCat);

  if (cInfo && !isNaN(sVal) && sVal >= 0) {
    Bot.setProperty(cInfo.prop, sVal, "integer");
    User.setProperty("waiting_for_price", null);

    if (request && request.id) {
      try {
        Api.answerCallbackQuery({
          callback_query_id: request.id,
          text: "✅ " + cInfo.name + " set to " + sVal + " Credits!",
          show_alert: false
        });
      } catch (e) {}
    }

    // Refresh back to pricing menu
    Bot.runCommand("/admin_pricing");
    return;
  }
}

// 2. Handle INC/DEC action: /prompt_set_price inc <cat> <delta>
if (action === "inc") {
  var iCat = parts[1] ? parts[1].toLowerCase() : "";
  var delta = parseInt(parts[2]) || 0;
  var cInfoInc = getCatInfo(iCat);

  if (cInfoInc) {
    var curVal = Bot.getProperty(cInfoInc.prop) || cInfoInc.def;
    var nextVal = curVal + delta;
    if (nextVal < 0) nextVal = 0;
    Bot.setProperty(cInfoInc.prop, nextVal, "integer");

    if (request && request.id) {
      try {
        Api.answerCallbackQuery({
          callback_query_id: request.id,
          text: "Price updated: " + nextVal + " Cr",
          show_alert: false
        });
      } catch (e) {}
    }

    action = iCat; // fall through to render updated menu
  }
}

// 3. Render Category Price Editor Menu
var targetCat = action;
var catInfo = getCatInfo(targetCat);

if (!catInfo) {
  Bot.runCommand("/admin_pricing");
  return;
}

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

User.setProperty("waiting_for_price", targetCat, "string");
var currentPrice = Bot.getProperty(catInfo.prop);
if (currentPrice === null || currentPrice === undefined) {
  currentPrice = catInfo.def;
}

var msgText = "💰 <b>Price Editor: " + catInfo.name + "</b>\n\n" +
  "• Current Price: <b>" + currentPrice + " Credits</b>\n\n" +
  "👇 <b>1-Tap Quick Select:</b>\n" +
  "<i>Tap any credit amount below to apply instantly, or reply directly in chat with custom number:</i>";

var kbd = [
  [
    { text: "1 Cr", callback_data: "/prompt_set_price set " + targetCat + " 1" },
    { text: "2 Cr", callback_data: "/prompt_set_price set " + targetCat + " 2" },
    { text: "3 Cr", callback_data: "/prompt_set_price set " + targetCat + " 3" }
  ],
  [
    { text: "4 Cr", callback_data: "/prompt_set_price set " + targetCat + " 4" },
    { text: "5 Cr", callback_data: "/prompt_set_price set " + targetCat + " 5" },
    { text: "10 Cr", callback_data: "/prompt_set_price set " + targetCat + " 10" }
  ],
  [
    { text: "➖ 1 Credit", callback_data: "/prompt_set_price inc " + targetCat + " -1" },
    { text: "➕ 1 Credit", callback_data: "/prompt_set_price inc " + targetCat + " 1" }
  ],
  [
    { text: "🔙 Back to Pricing", callback_data: "/admin_pricing" },
    { text: "👑 Admin Hub", callback_data: "/admin" }
  ]
];

Api.sendMessage({
  chat_id: chatId,
  text: msgText,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
