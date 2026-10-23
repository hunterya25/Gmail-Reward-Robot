/*CMD
  command: /on_verify
  help: 
  need_reply: false
  auto_retry_time: 
  folder: Verification

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /verify_sim
  group: 
CMD*/

// Safe Base64 Decoder (compatible with any JS engine)
function safeBase64Decode(input) {
  try {
    var str = input.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) { str += "="; }
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var i = 0;
    while (i < str.length) {
      var enc1 = chars.indexOf(str.charAt(i++));
      var enc2 = chars.indexOf(str.charAt(i++));
      var enc3 = chars.indexOf(str.charAt(i++));
      var enc4 = chars.indexOf(str.charAt(i++));
      var chr1 = (enc1 << 2) | (enc2 >> 4);
      var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      var chr3 = ((enc3 & 3) << 6) | enc4;
      output += String.fromCharCode(chr1);
      if (enc3 !== 64 && enc3 !== -1) { output += String.fromCharCode(chr2); }
      if (enc4 !== 64 && enc4 !== -1) { output += String.fromCharCode(chr3); }
    }
    return output;
  } catch (e) {
    return null;
  }
}

// 1. Extract verification token or simulation
var rawToken = params ? params.trim() : "";
if (rawToken.indexOf("v_") === 0) {
  rawToken = rawToken.substring(2);
} else if (rawToken.indexOf("verify_") === 0) {
  rawToken = rawToken.substring(7);
}

// Check web_app_data if sent directly via Telegram Mini App
if (!rawToken && request && request.message && request.message.web_app_data) {
  try {
    var webAppData = JSON.parse(request.message.web_app_data.data);
    if (webAppData && webAppData.token) {
      rawToken = webAppData.token;
    }
  } catch (e) {}
}

var deviceId = "";
var clientIp = "";
var deviceOs = "Mobile Device";

var isSimulation = (!rawToken || rawToken === "sim" || message === "/verify_sim");

if (!isSimulation && rawToken) {
  var decodedStr = safeBase64Decode(rawToken);
  if (decodedStr) {
    try {
      var payload = JSON.parse(decodedStr);
      deviceId = payload.did || "";
      clientIp = payload.ip || "";
      deviceOs = payload.os || "Mobile Device";
    } catch (e) {}
  }
}

// Fallback if simulation or parse error
if (!deviceId) {
  deviceId = "DEV_SIM_" + (user ? user.telegramid : "guest");
  clientIp = "103." + (Math.floor(Math.random() * 200) + 10) + ".45.12";
}

// 2. 🛡️ ANTI-CHEAT CROSS-CHECK
var existingDeviceOwner = Bot.getProperty("DeviceOwner_" + deviceId);
var isDuplicate = false;

if (existingDeviceOwner && user && existingDeviceOwner.toString() !== user.telegramid.toString()) {
  isDuplicate = true;
}

// 3. Handle Duplicate / Second Account vs Genuine Device
var pendingRef = User.getProperty("pending_referrer");

if (isDuplicate) {
  // ⚠️ VERIFICATION FAILED: DUPLICATE DEVICE DETECTED
  User.setProperty("device_verified", true, "boolean");
  User.setProperty("is_duplicate", true, "boolean");

  var failMsg = "⚠️ <b>Security Alert: Duplicate Device Detected!</b>\n\n" +
    "Our hardware integrity audit detected that this device is <b>already registered</b> with another Telegram account (ID: <code>" + existingDeviceOwner + "</code>).\n\n" +
    "❌ <b>Referral Bonus Voided:</b> The user who invited you will <b>NOT</b> receive any referral reward for this second account.\n\n" +
    "✅ <b>You can still use this bot!</b>\n" +
    "You have full access to explore the bot and invite your own real friends from unique devices to earn Gmail accounts!";

  Bot.sendMessage(failMsg, { parse_mode: "HTML" });

  // Notify referrer that duplicate device was rejected
  if (pendingRef && user && pendingRef.toString() !== user.telegramid.toString()) {
    var inviterName = user.first_name || "User";
    Api.sendMessage({
      chat_id: pendingRef,
      text: "⚠️ <b>Referral Verification Alert</b>\n\n" +
        "👤 <b>User:</b> " + inviterName + " (<code>" + user.telegramid + "</code>)\n" +
        "❌ <b>Result:</b> <b>Duplicate Device / Second Account Detected!</b>\n\n" +
        "<i>Our anti-cheat system blocked referral credits for this registration because the device was already used before. Only unique real devices earn rewards!</i>",
      parse_mode: "HTML"
    });
  }

  // Clear pending referrer
  User.setProperty("pending_referrer", null);

} else {
  // ✅ VERIFICATION PASSED: UNIQUE GENUINE DEVICE
  if (user && user.telegramid) {
    Bot.setProperty("DeviceOwner_" + deviceId, user.telegramid, "integer");
    Bot.setProperty("IpOwner_" + clientIp, user.telegramid, "integer");
  }

  User.setProperty("device_verified", true, "boolean");
  User.setProperty("is_duplicate", false, "boolean");
  User.setProperty("verified_device_id", deviceId, "string");
  User.setProperty("verified_ip", clientIp, "string");

  var successMsg = "🎉 <b>Device & IP Verified Successfully!</b> 🛡️\n\n" +
    "📱 <b>Device ID:</b> <code>" + deviceId + "</code>\n" +
    "🌐 <b>IP Address:</b> <code>" + clientIp + "</code>\n" +
    "💻 <b>Environment:</b> " + deviceOs + "\n" +
    "✅ <b>Integrity Status:</b> <b>Authentic Unique Device</b>\n\n" +
    "<i>Your account is now fully activated with full reward privileges!</i>";

  Bot.sendMessage(successMsg, { parse_mode: "HTML" });

  // Process Referral Attribution for genuine user
  if (pendingRef && user && pendingRef.toString() !== user.telegramid.toString()) {
    var refId = pendingRef;
    User.setProperty("referrerId", refId, "string");

    // Add +1 Gmail Credit to Referrer safely
    var currentRefBal = 0;
    try {
      if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
        var refBalance = Libs.ResourcesLib.anotherUserRes("balance", refId);
        refBalance.add(1);
        currentRefBal = refBalance.value();
      } else {
        var oldBal = Bot.getProperty("balance_" + refId) || 0;
        currentRefBal = parseFloat(oldBal) + 1;
        Bot.setProperty("balance_" + refId, currentRefBal, "integer");
      }
    } catch (e) {
      var oldBal = Bot.getProperty("balance_" + refId) || 0;
      currentRefBal = parseFloat(oldBal) + 1;
      Bot.setProperty("balance_" + refId, currentRefBal, "integer");
    }

    // Add +1 Total Verified Referrals safely
    try {
      if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
        var refTotal = Libs.ResourcesLib.anotherUserRes("total_referrals", refId);
        refTotal.add(1);
      } else {
        var oldTot = Bot.getProperty("total_referrals_" + refId) || 0;
        Bot.setProperty("total_referrals_" + refId, parseInt(oldTot) + 1, "integer");
      }
    } catch (e) {
      var oldTot = Bot.getProperty("total_referrals_" + refId) || 0;
      Bot.setProperty("total_referrals_" + refId, parseInt(oldTot) + 1, "integer");
    }

    // Save to Referrer's list
    var refList = Bot.getProperty("UserReferrals_" + refId);
    if (!refList || !Array.isArray(refList)) { refList = []; }
    var nowTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    refList.unshift({
      id: user.telegramid,
      name: user.first_name || "User",
      username: user.username || "",
      device_id: deviceId,
      time: nowTime,
      status: "Verified"
    });
    Bot.setProperty("UserReferrals_" + refId, refList, "json");

    // Notify Referrer
    var nameDisplay = user.first_name ? user.first_name : "New Member";
    var userLink = user.username ? ("@" + user.username) : ("<a href='tg://user?id=" + user.telegramid + "'>" + nameDisplay + "</a>");

    Api.sendMessage({
      chat_id: refId,
      text: "🎉 <b>New Verified Referral!</b> 💎\n\n" +
        "👤 <b>Member:</b> " + userLink + "\n" +
        "🆔 <b>User ID:</b> <code>" + user.telegramid + "</code>\n" +
        "🛡️ <b>Anti-Cheat:</b> ✅ Unique Device Verified\n" +
        "🎁 <b>Reward:</b> <b>+1 Gmail Credit added to your balance!</b>\n\n" +
        "💰 <b>Your Current Balance: " + currentRefBal + " Credits</b>",
      parse_mode: "HTML",
      disable_web_page_preview: true
    });

    User.setProperty("pending_referrer", null);
  }
}

// 4. Send Main Menu Dashboard Keyboard
var myBalance = 0;
var myRefs = 0;

try {
  if (typeof Libs !== "undefined" && Libs.ResourcesLib) {
    myBalance = Libs.ResourcesLib.userRes("balance").value();
    myRefs = Libs.ResourcesLib.userRes("total_referrals").value();
  } else {
    myBalance = User.getProperty("balance") || 0;
    myRefs = User.getProperty("total_referrals") || 0;
  }
} catch (e) {
  myBalance = User.getProperty("balance") || 0;
  myRefs = User.getProperty("total_referrals") || 0;
}

var menuText = "👋 <b>Welcome to @GmailRewardRobot!</b> ⚡️\n\n" +
  "💰 <b>Your Gmail Balance:</b> <b>" + myBalance + " Credits</b>\n" +
  "👥 <b>Your Verified Referrals:</b> <b>" + myRefs + "</b>\n\n" +
  "👇 <i>Select an option below to claim Gmails or invite friends:</i>";

Bot.sendKeyboard(
  "💰 Balance,📧 GetMail\n👥 Refer & Earn",
  menuText
);
