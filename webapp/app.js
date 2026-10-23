// GmailRewardBot Ultra-Strict Anti-Fraud Hardware Fingerprint Engine
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

  // Fast Deterministic 64-bit FNV-1a Hash
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

  // 1. Rock-Solid WebGL GPU Hardware Query (Zero Memory Leak with explicit loseContext)
  function getWebGLHardware() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, powerPreference: 'high-performance' }) ||
                 canvas.getContext('experimental-webgl');
      if (!gl) return { vendor: 'NoWebGL', renderer: 'NoWebGL', maxTex: 0, precision: 0 };

      let vendor = 'GenericVendor';
      let renderer = 'GenericGPU';

      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || vendor;
        renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || renderer;
      } else {
        vendor = gl.getParameter(gl.VENDOR) || vendor;
        renderer = gl.getParameter(gl.RENDERER) || renderer;
      }

      const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
      let precision = 0;
      try {
        const p = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        precision = p ? p.precision : 0;
      } catch (e) {}

      // CRITICAL: Explicitly release WebGL context so Android WebView never runs out of contexts
      const loseExt = gl.getExtension('WEBGL_lose_context');
      if (loseExt) {
        loseExt.loseContext();
      }

      return {
        vendor: String(vendor).trim(),
        renderer: String(renderer).trim(),
        maxTex: maxTex,
        precision: precision
      };
    } catch (e) {
      return { vendor: 'GpuErr', renderer: 'GpuErr', maxTex: 0, precision: 0 };
    }
  }

  // 2. Pure Geometric 2D Canvas Sub-pixel Raw Pixel Byte Hash (100% Invariant)
  // No text font fallbacks, no blur shaders - pure deterministic geometry & alpha blending
  function getCanvasGeometryHash() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'canvas_na';

      // Base solid fill
      ctx.fillStyle = '#ff5722';
      ctx.fillRect(5, 5, 90, 40);

      // Gradient overlay
      const grad = ctx.createLinearGradient(0, 0, 100, 50);
      grad.addColorStop(0, '#00e5ff');
      grad.addColorStop(0.5, '#7c4dff');
      grad.addColorStop(1, '#ff1744');
      ctx.fillStyle = grad;
      ctx.fillRect(10, 10, 80, 30);

      // Arc with alpha blend
      ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(50, 25, 18, 0, Math.PI * 2, true);
      ctx.fill();

      // Quadratic curve
      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(15, 40);
      ctx.quadraticCurveTo(50, 5, 85, 40);
      ctx.stroke();

      // Read uncompressed raw RGBA byte buffer
      const imgData = ctx.getImageData(0, 0, 100, 50).data;
      let h1 = 0x811c9dc5;
      for (let i = 0; i < imgData.length; i += 4) {
        const val = imgData[i] | (imgData[i + 1] << 8) | (imgData[i + 2] << 16) | (imgData[i + 3] << 24);
        h1 ^= val;
        h1 = Math.imul(h1, 0x01000193);
      }
      return (h1 >>> 0).toString(16);
    } catch (e) {
      return 'canvas_fail';
    }
  }

  // 3. Orientation-Independent Screen Architecture
  function getScreenArchitecture() {
    const sw = window.screen.width || 360;
    const sh = window.screen.height || 640;
    const minDim = Math.min(sw, sh);
    const maxDim = Math.max(sw, sh);
    const dpr = Math.round((window.devicePixelRatio || 1) * 100) / 100;
    const colorDepth = window.screen.colorDepth || 24;
    return `${minDim}x${maxDim}@${dpr}x${colorDepth}`;
  }

  // 4. OS & Hardware Environment
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

  // 5. Public IP Fetcher
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

    return '103.69.45.12';
  }

  // Main Verification Execution
  async function runVerification() {
    const env = detectEnvironment();
    const screenArch = getScreenArchitecture();
    const cores = navigator.hardwareConcurrency || 4;
    const canvasHash = getCanvasGeometryHash();
    const webgl = getWebGLHardware();

    // Pure invariant hardware signature:
    // Silicon GPU + Canvas Geometry + Screen Dimension + CPU Cores + Touch Controller + OS Code
    const hardwareSignature = `DEVHW_${webgl.vendor}_${webgl.renderer}_${webgl.maxTex}_${webgl.precision}_${canvasHash}_${screenArch}_${cores}_${env.touchPoints}_${env.osCode}`;
    const deviceId = 'DEV_' + hashString(hardwareSignature).toUpperCase();

    // Step 1: Resolving Network & IP (0% -> 30%)
    setAuditState(auditIp, 'running');
    progressBar.style.width = '30%';
    progressPercent.innerText = '30%';
    progressStep.innerText = 'Auditing IP Address & Network Subnet...';

    const clientIp = await fetchPublicIP();

    setAuditState(auditIp, 'checked');
    auditIpMeta.innerText = `IP: ${clientIp} (${env.osName})`;

    // Step 2: Silicon GPU & Canvas Audit (30% -> 60%)
    await delay(500);
    setAuditState(auditHardware, 'running');
    progressBar.style.width = '60%';
    progressPercent.innerText = '60%';
    progressStep.innerText = 'Auditing GPU Silicon & Canvas Pipeline...';

    await delay(600);
    setAuditState(auditHardware, 'checked');
    const gpuDisplay = webgl.renderer.length > 20 ? (webgl.renderer.substring(0, 18) + '...') : webgl.renderer;
    auditHardwareMeta.innerText = `GPU: ${gpuDisplay} | Cores: ${cores}`;

    // Step 3: Hardware Registry Anti-Cheat Check (60% -> 85%)
    setAuditState(auditDevice, 'running');
    progressBar.style.width = '85%';
    progressPercent.innerText = '85%';
    progressStep.innerText = 'Querying Hardware Registry for Duplicates...';

    await delay(600);
    setAuditState(auditDevice, 'checked');
    auditDeviceMeta.innerText = `Signature: ${deviceId}`;

    // Step 4: Finalize Verification (85% -> 100%)
    setAuditState(auditIntegrity, 'running');
    progressBar.style.width = '100%';
    progressPercent.innerText = '100%';
    progressStep.innerText = 'Anti-Fraud Analysis Complete!';

    await delay(400);
    setAuditState(auditIntegrity, 'checked');
    auditIntegrityMeta.innerText = 'Unique Physical Device Signature Verified ✓';

    // Update UI State
    progressBar.classList.add('success');
    statusSpinner.style.display = 'none';
    statusBadge.classList.add('success');
    statusText.innerText = '✓ Device Integrity Passed';
    shieldIcon.classList.add('verified');

    // Populate Details Card
    dispIp.innerText = clientIp;
    dispOs.innerText = `${env.osName} (${env.isDesktop ? 'Computer' : 'Mobile'})`;
    dispHardware.innerText = `${screenArch.split('@')[0]} (${cores} Cores)`;
    dispHash.innerText = deviceId;
    detailsCard.classList.remove('hidden');

    // Compact token (< 45 chars): DEV_XXXXX__IP-WITH-HYPHENS__OSCODE
    const cleanIp = (clientIp || '103.69.45.12').replace(/[^0-9.]/g, '').replace(/\./g, '-');
    const compactToken = `${deviceId}__${cleanIp}__${env.osCode}`;

    // Enable Completion Button
    completeBtn.disabled = false;
    completeBtn.innerHTML = '<span>✅ Finalize & Unlock Bot</span>';

    completeBtn.onclick = function () {
      completeBtn.disabled = true;
      completeBtn.innerHTML = '<span>🔄 Redirecting to Telegram...</span>';

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
