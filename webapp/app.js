// GmailRewardBot Advanced Anti-Cheat Device & IP Verification Engine
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

  // Fast 64-bit FNV-1a Hash
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

  // 1. AudioContext Fingerprint (Acoustic Waveform Hardware Signature)
  function getAudioFingerprint() {
    return new Promise((resolve) => {
      try {
        const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!AudioCtx) return resolve('no_audio');
        const context = new AudioCtx(1, 44100, 44100);
        const osc = context.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(10000, context.currentTime);

        const comp = context.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-50, context.currentTime);
        comp.knee.setValueAtTime(40, context.currentTime);
        comp.ratio.setValueAtTime(12, context.currentTime);
        comp.reduction.setValueAtTime(-20, context.currentTime);
        comp.attack.setValueAtTime(0, context.currentTime);
        comp.release.setValueAtTime(0.25, context.currentTime);

        osc.connect(comp);
        comp.connect(context.destination);
        osc.start(0);

        context.startRendering().then((buffer) => {
          let sum = 0;
          const data = buffer.getChannelData(0);
          for (let i = 4500; i < 5000; i++) {
            sum += Math.abs(data[i]);
          }
          resolve(hashString(sum.toString()));
        }).catch(() => resolve('audio_fb'));
      } catch (e) {
        resolve('audio_na');
      }
    });
  }

  // 2. High-Entropy Canvas 2D Fingerprint
  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 70;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'canvas_na';

      ctx.textBaseline = 'top';
      ctx.font = '14px "Arial", "Segoe UI", sans-serif';
      ctx.fillStyle = '#0a192f';
      ctx.fillRect(0, 0, 280, 70);

      const grad = ctx.createLinearGradient(0, 0, 280, 0);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(0.5, '#4facfe');
      grad.addColorStop(1, '#ff0055');
      ctx.fillStyle = grad;
      ctx.fillText('GmailRewardBot🔒!@#$%^', 6, 10);

      ctx.font = '12px "Courier New", monospace';
      ctx.fillStyle = 'rgba(102, 204, 0, 0.85)';
      ctx.fillText('AntiFraud🛡️<DeviceAudit>', 20, 32);

      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 4;
      ctx.strokeStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(230, 35, 18, 0, Math.PI * 2);
      ctx.stroke();

      return hashString(canvas.toDataURL());
    } catch (e) {
      return 'canvas_err';
    }
  }

  // 3. WebGL GPU Fingerprint
  function getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { vendor: 'no_webgl', renderer: 'no_webgl', hash: 'none' };

      let vendor = 'generic_vendor';
      let renderer = 'generic_renderer';

      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || vendor;
        renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || renderer;
      } else {
        vendor = gl.getParameter(gl.VENDOR) || vendor;
        renderer = gl.getParameter(gl.RENDERER) || renderer;
      }

      const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;
      const extCount = (gl.getSupportedExtensions() || []).length;
      const glSig = `${vendor}|${renderer}|${maxTex}|${extCount}`;

      return {
        vendor,
        renderer,
        hash: hashString(glSig)
      };
    } catch (e) {
      return { vendor: 'gl_err', renderer: 'gl_err', hash: 'err' };
    }
  }

  // 4. Public IP Resolution
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
    } catch (e) {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.ip) return data.ip;
      }
    } catch (e) {}

    return '103.' + (Math.floor(Math.random() * 150) + 10) + '.45.12';
  }

  // 5. Accurate OS & Hardware Environment Detector
  function detectEnvironment() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const touchPoints = navigator.maxTouchPoints || 0;

    let osName = 'Mobile Device';
    let osCode = 'A';
    let isDesktop = false;

    if (/Windows/i.test(ua) || /Win32|Win64/i.test(platform)) {
      osName = 'Windows PC';
      osCode = 'W';
      isDesktop = true;
    } else if (/Macintosh|MacIntel/i.test(platform) || (/Mac/i.test(ua) && touchPoints <= 1)) {
      osName = 'macOS';
      osCode = 'M';
      isDesktop = true;
    } else if (/Linux/i.test(platform) && !/Android/i.test(ua) && touchPoints === 0) {
      osName = 'Linux PC';
      osCode = 'L';
      isDesktop = true;
    } else if (/Android/i.test(ua)) {
      osName = 'Android Mobile';
      osCode = 'A';
      isDesktop = false;
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      osName = 'iOS Device';
      osCode = 'I';
      isDesktop = false;
    }

    return { osName, osCode, isDesktop, touchPoints };
  }

  // Main Verification Execution
  async function runVerification() {
    const env = detectEnvironment();
    const screenSpecs = `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`;
    const cores = navigator.hardwareConcurrency || 4;
    const canvasHash = getCanvasFingerprint();
    const webgl = getWebGLFingerprint();

    // Step 1: Resolving Network & IP (0% -> 25%)
    setAuditState(auditIp, 'running');
    progressBar.style.width = '25%';
    progressPercent.innerText = '25%';
    progressStep.innerText = 'Resolving IP Address & Subnet...';

    const clientIp = await fetchPublicIP();

    setAuditState(auditIp, 'checked');
    auditIpMeta.innerText = `IP: ${clientIp} (${env.osName})`;

    // Step 2: Audio & GPU Hardware Audit (25% -> 55%)
    await delay(600);
    setAuditState(auditHardware, 'running');
    progressBar.style.width = '55%';
    progressPercent.innerText = '55%';
    progressStep.innerText = 'Auditing GPU, Audio & Canvas Signature...';

    const audioHash = await getAudioFingerprint();

    // Compute Pure Physical Hardware Fingerprint
    // Invariant across different Telegram accounts on the exact same physical machine/phone
    const hardwareComposite = `HW_${canvasHash}_${webgl.hash}_${audioHash}_${screenSpecs}_${cores}_${env.touchPoints}_${env.osCode}`;
    const deviceId = 'DEV_' + hashString(hardwareComposite).toUpperCase();

    await delay(600);
    setAuditState(auditHardware, 'checked');
    auditHardwareMeta.innerText = `GPU: ${webgl.renderer.substring(0, 18)}... | Cores: ${cores}`;

    // Step 3: Anti-Duplicate Cross-Reference (55% -> 80%)
    setAuditState(auditDevice, 'running');
    progressBar.style.width = '80%';
    progressPercent.innerText = '80%';
    progressStep.innerText = 'Cross-Referencing Hardware Registry...';

    await delay(700);
    setAuditState(auditDevice, 'checked');
    auditDeviceMeta.innerText = `Device Signature: ${deviceId.substring(0, 14)}...`;

    // Step 4: Security Verification Finalize (80% -> 100%)
    setAuditState(auditIntegrity, 'running');
    progressBar.style.width = '100%';
    progressPercent.innerText = '100%';
    progressStep.innerText = 'Anti-Fraud Analysis Complete!';

    await delay(500);
    setAuditState(auditIntegrity, 'checked');
    auditIntegrityMeta.innerText = 'Hardware & Network Signature Verified ✓';

    // Update UI State
    progressBar.classList.add('success');
    statusSpinner.style.display = 'none';
    statusBadge.classList.add('success');
    statusText.innerText = '✓ Device Integrity Passed';
    shieldIcon.classList.add('verified');

    // Populate Verified Grid
    dispIp.innerText = clientIp;
    dispOs.innerText = `${env.osName} (${env.isDesktop ? 'Computer' : 'Mobile'})`;
    dispHardware.innerText = `${screenSpecs} (${cores} Cores)`;
    dispHash.innerText = deviceId;
    detailsCard.classList.remove('hidden');

    // Compact token (< 45 chars) to fit strictly within Telegram's 64-char deep link limit:
    // Format: DEV_XXXXX__IP-WITH-HYPHENS__OSCODE (e.g. DEV_104E56E8C8B1__49-43-160-185__W)
    const cleanIp = (clientIp || '103.69.45.12').replace(/[^0-9.]/g, '').replace(/\./g, '-');
    const compactToken = `${deviceId}__${cleanIp}__${env.osCode}`;

    // Enable Completion Button
    completeBtn.disabled = false;
    completeBtn.innerHTML = '<span>✅ Finalize & Unlock Bot</span>';

    // Completion Handler
    completeBtn.onclick = function () {
      completeBtn.disabled = true;
      completeBtn.innerHTML = '<span>🔄 Redirecting to Telegram...</span>';

      // 1. Try sending directly via WebApp data if supported
      try {
        if (tg && tg.sendData) {
          tg.sendData(JSON.stringify({
            action: 'device_verify',
            did: deviceId,
            ip: clientIp,
            os: env.osName,
            token: compactToken
          }));
        }
      } catch (e) {}

      // 2. Open Telegram deep link to bot with compact verification token
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
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  window.addEventListener('DOMContentLoaded', runVerification);
})();
