/*CMD
  command: /prompt_user_info
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Admin

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /prompt_add_bal, /prompt_cut_bal, /prompt_ban, /prompt_suspend, /prompt_unsuspend, /prompt_clear_dev, /prompt_add_normal, /prompt_add_recovery, /prompt_add_2fa, /prompt_wipe_stock, /prompt_set_channel, /prompt_set_webapp, /prompt_set_support, /prompt_broadcast, /prompt_broadcast_pin, /prompt_inspect_refs, /prompt_set_price, /prompt_msg_user, /prompt_create_promo
  group: 
CMD*/

var adm = Bot.getProperty("adminID");
if (user.telegramid != adm) {
  Bot.sendMessage("⛔️ <b>Unauthorized.</b>", { parse_mode: "HTML" });
  return;
}

var cmd = message ? message.split(" ")[0].toLowerCase() : "/prompt_user_info";
var chatId = chat ? chat.chatid : user.telegramid;

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

var msg = "";
var backCmd = "/admin";

if (cmd === "/prompt_user_info") {
  msg = "🔍 <b>Search User Profile:</b>\n\nSend command:\n<code>/user_info &lt;TELEGRAM_USER_ID&gt;</code>\n\n<i>Example:</i> <code>/user_info 8669173066</code>";
  backCmd = "/admin_users";
} else if (cmd === "/prompt_add_bal") {
  msg = "➕ <b>Add Credits to User:</b>\n\nSend command:\n<code>/add_bal &lt;USER_ID&gt; &lt;AMOUNT&gt;</code>\n\n<i>Example:</i> <code>/add_bal 8669173066 5</code>";
  backCmd = "/admin_users";
} else if (cmd === "/prompt_cut_bal") {
  msg = "➖ <b>Deduct Credits from User:</b>\n\nSend command:\n<code>/cut_bal &lt;USER_ID&gt; &lt;AMOUNT&gt;</code>\n\n<i>Example:</i> <code>/cut_bal 8669173066 2</code>";
  backCmd = "/admin_users";
} else if (cmd === "/prompt_ban") {
  msg = "⛔ <b>Ban / Unban User:</b>\n\nSend command:\n<code>/ban &lt;USER_ID&gt; [reason]</code> — To permanently ban\n<code>/unban &lt;USER_ID&gt;</code> — To unban\n\n<i>Example:</i> <code>/ban 8669173066 Multi-account cheating</code>\n<code>/unban 8669173066</code>";
  backCmd = "/admin_users";
} else if (cmd === "/prompt_suspend") {
  msg = "⏳ <b>Suspend User Temporarily:</b>\n\nSend command:\n<code>/suspend &lt;USER_ID&gt; &lt;TIME&gt; &lt;REASON&gt;</code>\n\n<b>Supported Time Formats:</b>\n• <code>2h</code> (2 Hours)\n• <code>30m</code> (30 Minutes)\n• <code>1h30m</code> or <code>1h 30m</code> (1 Hour 30 Minutes)\n• <code>24h</code> (24 Hours)\n\n<i>Example:</i>\n<code>/suspend 8669173066 2h Multi-account self referral attempt</code>\n<code>/suspend 8669173066 1h 30m Suspicious device activity</code>\n\n<i>💡 Note: The user receives a notice in IST date & time with the exact reason. When the duration finishes, the account unlocks automatically!</i>";
  backCmd = "/admin_users";
} else if (cmd === "/prompt_unsuspend") {
  msg = "🔓 <b>Lift User Suspension Early:</b>\n\nSend command:\n<code>/unsuspend &lt;USER_ID&gt;</code>\n\n<i>Example:</i> <code>/unsuspend 8669173066</code>";
  backCmd = "/admin_users";
} else if (cmd === "/prompt_clear_dev") {
  msg = "📱 <b>Reset Device / User Registry:</b>\n\nSend command:\n<code>/clear_device &lt;DEV_ID/USER_ID&gt;</code>\n\n<i>Example:</i> <code>/clear_device DEV_1601A022615DE</code>";
  backCmd = "/admin_users";
} else if (cmd === "/prompt_add_normal") {
  msg = "🟢 <b>Add Normal Fresh Gmails:</b>\n\nSend command:\n<code>/add_normal email:password</code>\n\n<i>You can paste 10-50 lines at once!</i>";
  backCmd = "/admin_stock";
} else if (cmd === "/prompt_add_recovery") {
  msg = "🛡️ <b>Add Recovery Attached Gmails:</b>\n\nSend command:\n<code>/add_recovery email:password:recovery_mail</code>\n\n<i>You can paste multiple lines at once!</i>";
  backCmd = "/admin_stock";
} else if (cmd === "/prompt_add_2fa") {
  msg = "🔐 <b>Add 2-Step Verification (2FA) Gmails:</b>\n\nSend command:\n<code>/add_2fa email:password:backup_key</code>\n\n<i>You can paste multiple lines at once!</i>";
  backCmd = "/admin_stock";
} else if (cmd === "/prompt_wipe_stock") {
  msg = "🧹 <b>Wipe Category Stock:</b>\n\nSend command:\n<code>/wipe_stock normal</code> — Wipe Normal stock\n<code>/wipe_stock recovery</code> — Wipe Recovery stock\n<code>/wipe_stock 2fa</code> — Wipe 2FA stock\n<code>/wipe_stock all</code> — Wipe entire inventory";
  backCmd = "/admin_stock";
} else if (cmd === "/prompt_set_channel") {
  msg = "📢 <b>Update Mandatory Channel Gate:</b>\n\nSend command:\n<code>/set_channel @YourChannelUsername</code>";
  backCmd = "/admin_settings";
} else if (cmd === "/prompt_set_webapp") {
  msg = "🌐 <b>Update Verification Mini App URL:</b>\n\nSend command:\n<code>/set_webapp https://your-hosted-app.vercel.app</code>";
  backCmd = "/admin_settings";
} else if (cmd === "/prompt_set_support") {
  msg = "💬 <b>Update Support Handle:</b>\n\nSend command:\n<code>/set_support @YourSupportUsername</code>";
  backCmd = "/admin_settings";
} else if (cmd === "/prompt_broadcast") {
  msg = "📢 <b>Global Text Broadcast:</b>\n\nSend command:\n<code>/broadcast &lt;Your Announcement Message&gt;</code>";
  backCmd = "/admin_broadcast";
} else if (cmd === "/prompt_broadcast_pin") {
  msg = "📌 <b>Global Pinned Announcement:</b>\n\nSend command:\n<code>/broadcast_pin &lt;Your Announcement Message&gt;</code>";
  backCmd = "/admin_broadcast";
} else if (cmd === "/prompt_msg_user") {
  msg = "✉️ <b>Send Private Message to User:</b>\n\nSend command:\n<code>/msg_user &lt;USER_TELEGRAM_ID&gt; &lt;Your Message&gt;</code>\n\n<i>Example:</i> <code>/msg_user 8669173066 Hello! Your custom order has been processed.</code>";
  backCmd = "/admin_broadcast";
} else if (cmd === "/prompt_create_promo") {
  msg = "➕ <b>Create Promotional Gift Code:</b>\n\nSend command:\n<code>/create_promo &lt;CODE&gt; &lt;AMOUNT&gt; &lt;MAX_USERS&gt;</code>\n\n<i>Example:</i> <code>/create_promo BONUS2 2 50</code>";
  backCmd = "/admin_promos";
} else if (cmd === "/prompt_inspect_refs") {
  msg = "🔍 <b>Inspect Member Referrals:</b>\n\nSend command:\n<code>/inspect_refs &lt;USER_ID&gt;</code>";
  backCmd = "/admin_refers";
} else if (cmd.indexOf("price") !== -1) {
  msg = "💰 <b>Set Category Price:</b>\n\nSend command:\n<code>/set_price normal &lt;credits&gt;</code>\n<code>/set_price recovery &lt;credits&gt;</code>\n<code>/set_price 2fa &lt;credits&gt;</code>\n<code>/set_price custom &lt;credits&gt;</code>\n<code>/set_ref_reward &lt;credits&gt;</code>";
  backCmd = "/admin_pricing";
} else {
  msg = "ℹ️ Please refer to the admin division menu.";
}

var kbd = [
  [{ text: "🔙 Back", callback_data: backCmd }],
  [{ text: "👑 Admin Hub", callback_data: "/admin" }]
];

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: kbd }
});
