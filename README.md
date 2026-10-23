# 💎 GmailRewardBot (@GmailRewardRobot) - Strict Anti-Cheat Referral Bot

Automated Telegram Bot created for **Bots.Business** platform with **Telegram Mini App Device & IP Verification** and strict anti-fraud detection.

---

## 📌 Features & Architecture

1. **Bot Identity**:
   - **Bot Name**: `GmailRewardBot`
   - **Bot Username**: `@GmailRewardRobot`
   - **Mandatory Channel**: [`@BotsByAntares`](https://t.me/BotsByAntares)

2. **Step-by-Step Flow**:
   - **Step 1: `/start` & Channel Join**:
     - User receives a bold welcome message with emojis.
     - Bot requires user to join `https://t.me/BotsByAntares`.
   - **Step 2: Channel Verification & Auto-Deletion**:
     - User clicks `✅ Verify Membership`.
     - Bot verifies chat membership using Telegram Bot API (`getChatMember`).
     - **The channel join prompt message is automatically deleted (`deleteMessage`)** upon verification!
   - **Step 3: Device & IP Verification (Mini App)**:
     - Bot displays verification prompt with an inline button: `🔐 Verify Device & IP (Mini App)`.
     - Clicking opens the high-tech Telegram Mini App (`webapp/index.html`).
     - Scans for **2–3 seconds**:
       - 🌐 Public IP & Network Subnet detection
       - 📱 Hardware & GPU (WebGL unmasked renderer + Canvas 2D + Screen dimensions + CPU cores)
       - 🔒 Persistent LocalStorage Device UUID (`__gmail_reward_device_uuid`)
     - Generates a unique deterministic device fingerprint token (`DEV_XXXXX`).
   - **Step 4: Strict Anti-Cheat Referral Attribution**:
     - **If Duplicate Device / Second Account Detected**:
       - System detects the phone/PC has already been used by another Telegram account.
       - ❌ **Referrer receives 0 credit** (preventing multi-account self-referral fraud).
       - Both referrer and user receive alert explaining the reason.
       - ✅ **The user is STILL allowed to use the bot** and can refer genuine friends to earn!
     - **If Unique Genuine Device**:
       - ✅ Device and IP are registered to this Telegram user.
       - 🎁 Referrer is credited with **+1 Gmail Credit** and **+1 Verified Referral**.
       - Celebratory notification sent to referrer.
   - **Step 5: Main Menu Buttons**:
     - Matching requested layout with vivid emojis:
       ```
       [ 💰 Balance ]  [ 📧 GetMail ]
       [      👥 Refer & Earn      ]
       ```

---

## 📂 Project Structure

```
MAIL PRO/
├── bot.json                              # Bots.Business export manifest
├── README.md                             # Documentation & Setup guide
├── libs/
│   ├── ResourcesLib.js                   # BB balance and referral resources library
│   └── Webhooks.js                       # BB webhook integration library
├── commands/
│   ├── @.js                              # Global pre-processor (ban & force checks)
│   ├── _start.js                         # /start command & deep link referral handler
│   ├── _set_admin.js                     # /set_admin & /loginme configuration
│   ├── Channel/
│   │   ├── _check_join.js                # Initiates @BotsByAntares check
│   │   ├── _on_check_join.js             # Verifies & deletes message on success
│   │   └── _on_check_join_error.js       # Channel error handler
│   ├── Verification/
│   │   ├── _verify_prompt.js             # Inline button opening Mini App
│   │   └── _on_verify.js                 # Anti-cheat duplicate audit & credit dispatcher
│   ├── Menu/
│   │   ├── 💰 Balance.js                 # Balance, credits & claim stats
│   │   ├── 📧 GetMail.js                 # Stock info & redeem menu
│   │   ├── 👥 Refer & Earn.js            # Referral link & Telegram share button
│   │   ├── _redeem_mail.js               # Dispenses fresh Gmail from stock
│   │   ├── _my_mails.js                  # Shows claimed accounts history
│   │   └── _my_referrals.js              # Lists invited friends with verification status
│   └── Admin/
│       ├── _admin.js                     # Admin dashboard & bot metrics
│       ├── _add_gmail.js                 # Single / bulk Gmail inventory loader
│       ├── _stock.js                     # Inventory inspector
│       ├── _set_webapp.js                # Dynamic Mini App URL setter
│       └── _clear_device.js              # Device unbind tool for testing
└── webapp/
    ├── index.html                        # Universal Premium UI cyber radar scanner
    ├── style.css                         # Dark mode glassmorphism & radar animations
    └── app.js                            # Hardware/Canvas/IP fingerprinting engine
```

---

## 🚀 How to Setup & Deploy

1. **Bots.Business Import**:
   - Push this `MAIL PRO` repository to GitHub or import the commands directly into your bot at [Bots.Business](https://bots.business).
   - Enter your bot token from `@BotFather`.
   - Run `/set_admin` in your bot to claim administrator privileges.

2. **Mini App Deployment**:
   - Host the `webapp/` folder on **GitHub Pages**, **Vercel**, or **Cloudflare Pages** (takes 1 minute, completely free).
   - Update the bot with your webapp URL:
     ```
     /set_webapp https://your-username.github.io/gmail-verifier/
     ```
   - *Note: For immediate testing inside Telegram without hosting, an "⚡ Instant Verify (Simulator)" button is also included in `/verify_prompt`.*

3. **Loading Gmail Stock**:
   - Add Gmail accounts to stock using:
     ```
     /add_gmail
     example1@gmail.com:password123:recovery1@gmail.com
     example2@gmail.com:password456:recovery2@gmail.com
     ```
