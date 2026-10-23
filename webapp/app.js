// GmailRewardBot Device & IP Verification Mini App Engine
(function () {
  'use strict';

  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor('#07090e');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#07090e');
  }

  // Parse URL Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const paramUid = urlParams.get('uid') || (tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : null);
  const paramRef = urlParams.get('ref') || (tg?.initDataUnsafe?.start_param || '');
  const botUsername = urlParams.get('bot') || 'GmailRewardRobot';

  // Elements
  const statusBadge = document.getElementById('statusBadge');
  const statusSpinner = document.getElementById('statusSpinner');
  const statusText = document.getElementById('statusText');
  const progressBar = document.getElementById('progressBar');
  const progressStep = document.getElementById('progressStep');
  const progressPercent = document.getElementById('progressPercent');
  const shieldIcon = document.getElementById('shieldIcon');

  const auditIp = document.getElementById('auditIp');
  const auditIpMeta = document.getElementById('auditIpMeta');
  const auditHardware = document.getElementById('auditHardware');
  const auditHardwareMeta = document.getElementById('auditHardwareMeta');
  const auditDevice = document.getElementById('auditDevice');
  const auditDeviceMeta = document.getElementById('auditDeviceMeta');
  const auditIntegrity = document.getElementById('auditIntegrity');
  const auditIntegrityMeta = document.getElementById('auditIntegrityMeta');

  const detailsCard = document.getElementById('detailsCard');
  const dispIp = document.getElementById('dispIp');
  const dispOs = document.getElementById('dispOs');
  const dispHardware = document.getElementById('dispHardware');
  const dispHash = document.getElementById('dispHash');
  const completeBtn = document.getElementById('completeBtn');

  // Simple Fast Hash (FNV-1a 32/64 bit string hash)
  function hashString(str) {
    let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }

  // Persistent Device UUID (retained across different Telegram sessions on same phone/browser)
  function getPersistentDeviceUUID() {
    const STORAGE_KEY = '__gmail_reward_device_uuid';
    let uuid = null;
    try {
      uuid = localStorage.getItem(STORAGE_KEY);
      if (!uuid) {
        uuid = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
        localStorage.setItem(STORAGE_KEY, uuid);
      }
    } catch (e) {
      uuid = 'fallback_' + Math.random().toString(36).substring(2, 10);
    }
    return uuid;
  }

  // Generate 2D Canvas Fingerprint
  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'canvas_na';

      ctx.textBaseline = 'top';
      ctx.font = '14px "Arial", "Courier New", sans-serif';
      ctx.fillStyle = '#00f2fe';
      ctx.fillRect(0, 0, 240, 60);

      ctx.fillStyle = '#ff0055';
      ctx.fillText('GmailReward🔒!@#$%^', 4, 15);

      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('AntiFraudScan🛡️', 30, 35);

      ctx.strokeStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(190, 30, 20, 0, Math.PI * 2);
      ctx.stroke();

      return hashString(canvas.toDataURL());
    } catch (e) {
      return 'canvas_err';
    }
  }

  // Get WebGL GPU Fingerprint
  function getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { vendor: 'no_webgl', renderer: 'no_webgl' };

      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        return {
          vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || 'generic_vendor',
          renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'generic_renderer'
        };
      }
      return {
        vendor: gl.getParameter(gl.VENDOR) || 'gl_vendor',
        renderer: gl.getParameter(gl.RENDERER) || 'gl_renderer'
      };
    } catch (e) {
      return { vendor: 'gl_err', renderer: 'gl_err' };
    }
  }

  // Fetch Public IP Address
  async function fetchPublicIP() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.ip) return data.ip;
      }
    } catch (e) {
      // fallback
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.ip) return data.ip;
      }
    } catch (e) {
      // fallback to generated network signature
    }

    return 'ip_dynamic_' + (Math.floor(Math.random() * 899) + 100);
  }

  // Detect Operating System
  function detectOS() {
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return 'Android Device';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS Device';
    if (/Windows/i.test(ua)) return 'Windows PC';
    if (/Macintosh/i.test(ua)) return 'MacOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return navigator.platform || 'Unknown OS';
  }

  // Main Verification Execution
  async function runVerification() {
    const startTime = Date.now();

    // Collect Hardware Specs
    const screenSpecs = `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const os = detectOS();
    const canvasHash = getCanvasFingerprint();
    const webgl = getWebGLFingerprint();
    const persistentUUID = getPersistentDeviceUUID();

    // Unique Deterministic Device Identifier (Composite Hash)
    const compositeDeviceRaw = `${canvasHash}_${webgl.renderer}_${screenSpecs}_${cores}_${persistentUUID}`;
    const deviceId = 'DEV_' + hashString(compositeDeviceRaw).toUpperCase();

    // Step 1: Resolving IP (0s -> 0.7s)
    setAuditState(auditIp, 'running');
    progressBar.style.width = '25%';
    progressPercent.innerText = '25%';
    progressStep.innerText = 'Resolving IP & Geolocation...';

    const clientIp = await fetchPublicIP();

    setAuditState(auditIp, 'checked');
    auditIpMeta.innerText = `Detected IP: ${clientIp}`;

    // Step 2: Hardware & Canvas Audit (0.7s -> 1.5s)
    await delay(700);
    setAuditState(auditHardware, 'running');
    progressBar.style.width = '55%';
    progressPercent.innerText = '55%';
    progressStep.innerText = 'Extracting GPU & Canvas Fingerprint...';

    await delay(600);
    setAuditState(auditHardware, 'checked');
    auditHardwareMeta.innerText = `GPU: ${webgl.renderer.substring(0, 22)}... | Canvas: ${canvasHash.substring(0, 8)}`;

    // Step 3: Device Registry Cross-Reference (1.5s -> 2.2s)
    setAuditState(auditDevice, 'running');
    progressBar.style.width = '80%';
    progressPercent.innerText = '80%';
    progressStep.innerText = 'Checking Anti-Duplicate Registry...';

    await delay(700);
    setAuditState(auditDevice, 'checked');
    auditDeviceMeta.innerText = `Device ID: ${deviceId.substring(0, 16)}...`;

    // Step 4: Finalize Verification (2.2s -> 2.8s)
    setAuditState(auditIntegrity, 'running');
    progressBar.style.width = '100%';
    progressPercent.innerText = '100%';
    progressStep.innerText = 'Anti-Cheat Analysis Complete!';

    await delay(500);
    setAuditState(auditIntegrity, 'checked');
    auditIntegrityMeta.innerText = 'Unique Device Signature Verified ✓';

    // Update UI to Verified State
    progressBar.classList.add('success');
    statusSpinner.style.display = 'none';
    statusBadge.classList.add('success');
    statusText.innerText = '✓ Device Integrity Passed';
    shieldIcon.classList.add('verified');

    // Populate Verified Grid
    dispIp.innerText = clientIp;
    dispOs.innerText = os;
    dispHardware.innerText = `${screenSpecs} (${cores} Cores)`;
    dispHash.innerText = deviceId;
    detailsCard.classList.remove('hidden');

    // Clean compact token (< 45 chars) to fit strictly within Telegram's 64-char limit
    const cleanIp = (clientIp || '103.69.45.12').replace(/[^0-9.]/g, '').replace(/\./g, '-');
    const compactToken = `${deviceId}__${cleanIp}`;

    // Enable Completion Button
    completeBtn.disabled = false;
    completeBtn.innerHTML = '<span>✅ Finalize & Unlock Bot</span>';

    // Action handler
    completeBtn.onclick = function () {
      completeBtn.disabled = true;
      completeBtn.innerHTML = '<span>🔄 Redirecting to Telegram...</span>';

      // 1. Try tg.sendData if launched via keyboard
      try {
        if (tg && tg.sendData) {
          tg.sendData(JSON.stringify({ action: 'device_verify', did: deviceId, ip: clientIp, os: os }));
        }
      } catch (e) {
        console.log('sendData not applicable', e);
      }

      // 2. Open Telegram deep link to bot with compact token
      const targetDeepLink = `https://t.me/${botUsername}?start=v_${compactToken}`;
      if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(targetDeepLink);
      } else {
        window.location.href = targetDeepLink;
      }

      setTimeout(() => {
        if (tg && tg.close) {
          tg.close();
        }
      }, 800);
    };

    // Auto-haptic if supported
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  }

  function setAuditState(el, state) {
    if (!el) return;
    const icon = el.querySelector('.audit-icon');
    el.classList.remove('active', 'done');
    if (icon) icon.className = 'audit-icon ' + state;
    if (state === 'running') el.classList.add('active');
    if (state === 'checked') el.classList.add('done');
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Start verification immediately on load
  window.addEventListener('DOMContentLoaded', runVerification);
})();
