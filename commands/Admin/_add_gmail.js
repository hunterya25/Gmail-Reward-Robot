/*CMD
  command: /add_gmail
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
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "html" });
  return;
}

var text = params ? params.trim() : "";
if (!text && message && message.indexOf("/add_gmail") === 0) {
  text = message.replace("/add_gmail", "").trim();
}

if (!text) {
  Bot.sendMessage(
    "ℹ️ <b>How to Add Gmails to Stock:</b>\n\n" +
    "Send: <code>/add_gmail email:password:recovery</code>\n\n" +
    "<b>Bulk Example (Multiple Lines):</b>\n" +
    "<code>/add_gmail\n" +
    "user1@gmail.com:pass1:rec1@mail.com\n" +
    "user2@gmail.com:pass2:rec2@mail.com</code>",
    { parse_mode: "html" }
  );
  return;
}

var lines = text.split("\n");
var addedCount = 0;
var currentStock = Bot.getProperty("GmailStock", []);
if (!currentStock) { currentStock = []; }

for (var i = 0; i < lines.length; i++) {
  var line = lines[i].trim();
  if (!line || line.indexOf(":") === -1) { continue; }
  var parts = line.split(":");
  var email = parts[0] ? parts[0].trim() : "";
  var password = parts[1] ? parts[1].trim() : "";
  var recovery = parts[2] ? parts[2].trim() : "None";

  if (email && password) {
    currentStock.push({
      email: email,
      password: password,
      recovery: recovery,
      added_at: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    });
    addedCount++;
  }
}

Bot.setProperty("GmailStock", currentStock, "json");

Bot.sendMessage(
  "✅ <b>Successfully Added " + addedCount + " Gmail Account(s) to Stock!</b>\n\n" +
  "📦 <b>Total Active Stock:</b> <b>" + currentStock.length + " Accounts</b>",
  { parse_mode: "html" }
);
