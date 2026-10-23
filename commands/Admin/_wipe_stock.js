/*CMD
  command: /wipe_stock
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

var cat = params ? params.trim().toLowerCase() : "";
if (!cat && message) {
  cat = message.replace("/wipe_stock", "").trim().toLowerCase();
}

if (!cat || (cat !== "normal" && cat !== "recovery" && cat !== "2fa" && cat !== "all")) {
  Bot.sendMessage("ℹ️ <b>Usage:</b> <code>/wipe_stock normal|recovery|2fa|all</code>", { parse_mode: "HTML" });
  return;
}

if (cat === "normal") {
  Bot.setProperty("Stock_Normal", [], "json");
  Bot.setProperty("GmailStock", [], "json");
  Bot.sendMessage("🧹 <b>Normal Gmails Stock Cleared!</b>", { parse_mode: "HTML" });
} else if (cat === "recovery") {
  Bot.setProperty("Stock_Recovery", [], "json");
  Bot.sendMessage("🧹 <b>Recovery Gmails Stock Cleared!</b>", { parse_mode: "HTML" });
} else if (cat === "2fa") {
  Bot.setProperty("Stock_2FA", [], "json");
  Bot.sendMessage("🧹 <b>2FA Gmails Stock Cleared!</b>", { parse_mode: "HTML" });
} else if (cat === "all") {
  Bot.setProperty("Stock_Normal", [], "json");
  Bot.setProperty("GmailStock", [], "json");
  Bot.setProperty("Stock_Recovery", [], "json");
  Bot.setProperty("Stock_2FA", [], "json");
  Bot.sendMessage("🧹 <b>ALL Gmail Stock Cleared across all categories!</b>", { parse_mode: "HTML" });
}
