/*CMD
  command: /add_normal
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /add_recovery, /add_2fa
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var cmd = message ? message.split(" ")[0].toLowerCase() : "/add_normal";
var input = params ? params.trim() : "";
if (!input && message) {
  input = message.substring(cmd.length).trim();
}

var cat = "normal";
var stockKey = "Stock_Normal";
var catTitle = "🟢 Normal Fresh Gmails";

if (cmd.indexOf("recovery") !== -1) {
  cat = "recovery";
  stockKey = "Stock_Recovery";
  catTitle = "🛡️ Recovery Attached Gmails";
} else if (cmd.indexOf("2fa") !== -1) {
  cat = "2fa";
  stockKey = "Stock_2FA";
  catTitle = "🔐 2-Step Verification (2FA) Gmails";
}

if (!input) {
  var usageExample = "<code>" + cmd + " email:password</code>";
  if (cat === "recovery") {
    usageExample = "<code>/add_recovery email:password:recovery_mail:notes</code>\n<i>(notes is optional, write 'none' to skip)</i>";
  } else if (cat === "2fa") {
    usageExample = "<code>/add_2fa email:password:2fakey:apppass</code>\n<i>(apppass is optional, write 'none' to skip)</i>";
  }

  var usageText = "ℹ️ <b>Usage for " + catTitle + ":</b>\n\n" +
    usageExample + "\n\n" +
    "<i>You can also paste multiple lines at once!</i>";
  Bot.sendMessage(usageText, { parse_mode: "HTML" });
  return;
}

var lines = input.split("\n");
var addedCount = 0;
var stockArr = Bot.getProperty(stockKey);
if (!stockArr || !Array.isArray(stockArr)) { stockArr = []; }

for (var i = 0; i < lines.length; i++) {
  var line = lines[i].trim();
  if (!line) continue;

  var parts = line.split(":");
  if (parts.length >= 2) {
    var email = parts[0].trim();
    var password = parts[1].trim();
    var extra = parts.length > 2 ? parts[2].trim() : "";
    var fourth = parts.length > 3 ? parts[3].trim() : "";

    if (extra.toLowerCase() === "none") extra = "";
    if (fourth.toLowerCase() === "none") fourth = "";

    var item = {
      email: email,
      password: password,
      recovery: (cat === "recovery" ? extra : null),
      two_factor: (cat === "2fa" ? extra : null),
      app_password: (cat === "2fa" && fourth ? fourth : null),
      extra_notes: (cat === "recovery" && fourth ? fourth : null),
      category: catTitle,
      added_at: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    };

    stockArr.push(item);
    addedCount++;
  }
}

Bot.setProperty(stockKey, stockArr, "json");

var successMsg = "✅ <b>Inventory Successfully Updated!</b> 📦\n\n" +
  "• Category: <b>" + catTitle + "</b>\n" +
  "• Accounts Added: <b>+" + addedCount + "</b>\n" +
  "• Total Live Stock in Category: <b>" + stockArr.length + "</b>";

var kbd = [
  [{ text: "📦 View Stock", callback_data: "/stock" }],
  [{ text: "🔙 Back to Stock Division", callback_data: "/admin_stock" }]
];

Api.sendMessage({
  chat_id: chat ? chat.chatid : user.telegramid,
  text: successMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
