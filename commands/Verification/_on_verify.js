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

var chatId = (chat && chat.chatid) ? chat.chatid : (user ? user.telegramid : null);

// 🗑️ Delete previous bot message for a clean chat interface
var lastBotMsg = User.getProperty("last_bot_msg_id");
if (lastBotMsg) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: lastBotMsg });
  } catch (e) {}
  User.setProperty("last_bot_msg_id", null);
}

if (request && request.message && request.message.message_id) {
  try {
    Api.deleteMessage({ chat_id: chatId, message_id: request.message.message_id });
  } catch (e) {}
}

// 1. Extract verification token
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
    if (webAppData) {
      if (webAppData.token) {
        rawToken = webAppData.token;
      } else if (webAppData.did) {
        rawToken = webAppData.did + "__" + (webAppData.ip || "103.69.45.12");
        if (webAppData.os) {
          rawToken += "__" + webAppData.os;
        }
      }
    }
  } catch (e) {}
}

var deviceId = "";
var clientIp = "";
var deviceOs = "Mobile Device 📱";

var isSimulation = (!rawToken || rawToken === "sim" || message === "/verify_sim");

if (!isSimulation && rawToken) {
  // Check compact format: DID__IP__OS (e.g. DEV_ABC123__49-43-160-185__W)
  if (rawToken.indexOf("__") !== -1) {
    var parts = rawToken.split("__");
    deviceId = parts[0] || "";
    if (parts[1]) {
      clientIp = parts[1].replace(/-/g, ".");
    }
    if (parts[2]) {
      var osCode = parts[2].trim().toUpperCase();
      if (osCode === "W" || osCode === "WINDOWS") {
        deviceOs = "Windows PC 💻";
      } else if (osCode === "M" || osCode === "MAC" || osCode === "MACOS") {
        deviceOs = "macOS Computer 🖥️";
      } else if (osCode === "L" || osCode === "LINUX") {
        deviceOs = "Linux PC 🐧";
      } else if (osCode === "I" || osCode === "IOS") {
        deviceOs = "iOS Apple Device 🍏";
      } else if (osCode === "A" || osCode === "ANDROID") {
        deviceOs = "Android Mobile 📱";
      } else {
        deviceOs = parts[2];
      }
    }
  } else {
    // Base64 JSON fallback
    try {
      var str = rawToken.replace(/-/g, "+").replace(/_/g, "/");
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
      var payload = JSON.parse(output);
      deviceId = payload.did || "";
      clientIp = payload.ip || "";
      deviceOs = payload.os || "Mobile Device 📱";
    } catch (e) {}
  }
}

// Fallback if simulation or parse error
if (!deviceId) {
  deviceId = "DEV_SIM_" + (user ? user.telegramid : "guest");
  clientIp = "103." + (Math.floor(Math.random() * 200) + 10) + ".45.12";
}

if (!clientIp) {
  clientIp = "103.69.45.12";
}

// 2. 🛡️ ADVANCED ANTI-CHEAT & MULTI-ACCOUNT DETECTION
var existingDeviceOwner = Bot.getProperty("DeviceOwner_" + deviceId);
var existingIpOwner = Bot.getProperty("IpOwner_" + clientIp);
var pendingRef = User.getProperty("pending_referrer");

function getSubnet(ip) {
  if (!ip || ip.indexOf(".") === -1) return "";
  var parts = ip.split(".");
  if (parts.length >= 3) {
    return parts[0] + "." + parts[1] + "." + parts[2];
  }
  return "";
}

var clientSubnet = getSubnet(clientIp);

var isDuplicate = false;
var detectionReason = "";
var primaryOwner = "";

if (existingDeviceOwner && user && existingDeviceOwner.toString() !== user.telegramid.toString()) {
  isDuplicate = true;
  detectionReason = "Duplicate Device / Multi-Account Detected (Same Physical Hardware)";
  primaryOwner = existingDeviceOwner;
} else if (existingIpOwner && user && existingIpOwner.toString() !== user.telegramid.toString()) {
  isDuplicate = true;
  detectionReason = "Duplicate Network / Same IP Address (WiFi/Hotspot Multi-Account)";
  primaryOwner = existingIpOwner;
} else if (pendingRef && user) {
  var referrerIp = Bot.getProperty("UserIp_" + pendingRef);
  var referrerDevice = Bot.getProperty("UserDevice_" + pendingRef);
  var referrerSubnet = getSubnet(referrerIp);

  if (referrerDevice && referrerDevice === deviceId) {
    isDuplicate = true;
    detectionReason = "Self-Referral Blocked (Same Physical Device as Referrer)";
    primaryOwner = pendingRef;
  } else if (referrerIp && referrerIp === clientIp) {
    isDuplicate = true;
    detectionReason = "Self-Referral Blocked (Exact Same IP Network as Referrer)";
    primaryOwner = pendingRef;
  } else if (referrerSubnet && clientSubnet && referrerSubnet === clientSubnet) {
    isDuplicate = true;
    detectionReason = "Self-Referral Blocked (Same Cellular Subnet / Flight Mode Multi-Account: " + clientSubnet + ".*)";
    primaryOwner = pendingRef;
  }
}

// 3. Handle Duplicate / Second Account vs Genuine Device
if (isDuplicate) {
  User.setProperty("device_verified", true, "boolean");
  User.setProperty("is_duplicate", true, "boolean");

  if (user && user.telegramid) {
    Bot.setProperty("UserDevice_" + user.telegramid, deviceId, "string");
    Bot.setProperty("UserIp_" + user.telegramid, clientIp, "string");
  }

  var failMsg = "🚫 <b>Device & Network Verification Failed!</b> ⚠️\n\n" +
    "📱 <b>Device ID:</b> <code>" + deviceId + "</code>\n" +
    "🌐 <b>IP Address:</b> <code>" + clientIp + "</code>\n" +
    "💻 <b>Environment:</b> " + deviceOs + "\n" +
    "❌ <b>Detection:</b> <b>" + detectionReason + "</b>\n" +
    "👤 <b>Primary Registered Owner:</b> <code>Telegram ID: " + primaryOwner + "</code>\n\n" +
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "⛔ <b>Referral Reward Voided:</b>\n" +
    "The user who referred you will <b>NOT</b> receive any credit or reward for this account because this network/device was already used previously.\n\n" +
    "✅ <b>You Can Still Use This Bot!</b>\n" +
    "You have full access to explore the bot. You can invite your own real friends from their unique devices & networks to earn free Gmail accounts!";

  Bot.sendMessage(failMsg, { parse_mode: "HTML" });

  // Notify referrer that duplicate referral was voided
  if (pendingRef && user && pendingRef.toString() !== user.telegramid.toString()) {
    var inviterName = user.first_name || "User";
    Api.sendMessage({
      chat_id: pendingRef,
      text: "⚠️ <b>Referral Alert: Multi-Account Blocked!</b> 🚫\n\n" +
        "👤 <b>User:</b> " + inviterName + " (<code>" + user.telegramid + "</code>)\n" +
        "📱 <b>Device ID:</b> <code>" + deviceId + "</code>\n" +
        "🌐 <b>IP Address:</b> <code>" + clientIp + "</code>\n" +
        "💻 <b>Environment:</b> " + deviceOs + "\n" +
        "❌ <b>Reason:</b> " + detectionReason + "\n" +
        "🎁 <b>Points Credited:</b> <b>0 Credits</b>\n\n" +
        "<i>Only authentic, unique devices & networks count towards referral earnings!</i>",
      parse_mode: "HTML"
    });
  }

  // Clear pending referrer
  User.setProperty("pending_referrer", null);

} else {
  // ✅ VERIFICATION PASSED: UNIQUE GENUINE DEVICE & NETWORK
  if (user && user.telegramid) {
    Bot.setProperty("DeviceOwner_" + deviceId, user.telegramid, "integer");
    Bot.setProperty("IpOwner_" + clientIp, user.telegramid, "integer");
    Bot.setProperty("UserDevice_" + user.telegramid, deviceId, "string");
    Bot.setProperty("UserIp_" + user.telegramid, clientIp, "string");

    // Track keys for clean /reset_all
    var devKeys = Bot.getProperty("RegisteredDeviceKeys");
    if (!devKeys || !Array.isArray(devKeys)) { devKeys = []; }
    if (devKeys.indexOf(deviceId) === -1) {
      devKeys.push(deviceId);
      Bot.setProperty("RegisteredDeviceKeys", devKeys, "json");
    }

    var ipKeys = Bot.getProperty("RegisteredIpKeys");
    if (!ipKeys || !Array.isArray(ipKeys)) { ipKeys = []; }
    if (ipKeys.indexOf(clientIp) === -1) {
      ipKeys.push(clientIp);
      Bot.setProperty("RegisteredIpKeys", ipKeys, "json");
    }
  }

  User.setProperty("device_verified", true, "boolean");
  User.setProperty("is_duplicate", false, "boolean");
  User.setProperty("verified_device_id", deviceId, "string");
  User.setProperty("verified_ip", clientIp, "string");

  var successMsg = "🎉 <b>Device & IP Verified Successfully!</b> 🛡️\n\n" +
    "📱 <b>Device ID:</b> <code>" + deviceId + "</code>\n" +
    "🌐 <b>IP Address:</b> <code>" + clientIp + "</code>\n" +
    "💻 <b>Environment:</b> " + deviceOs + "\n" +
    "✅ <b>Integrity Status:</b> <b>Authentic Unique Device & Network</b>\n\n" +
    "<i>Your account is now fully activated with full reward privileges!</i>";

  Bot.sendMessage(successMsg, { parse_mode: "HTML" });

  // Process Referral Attribution for genuine unique user
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
        "🛡️ <b>Anti-Cheat:</b> ✅ Unique Device & Network Verified\n" +
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
  "💰 Balance,📧 GetMail\n👥 Refer & Earn,📜 My Mails\n🎯 Custom Order,📦 Live Stock\n🏆 Leaderboard,🛡️ My Device\n🎟️ Promo Code,💬 Support\nℹ️ Rules & FAQ",
  menuText
);
