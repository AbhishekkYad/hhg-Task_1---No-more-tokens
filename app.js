// ==========================================================================
// HACKER HOUSE GOA 2026 — OFFICIAL POSTER GRAPHIC ENGINE (app.js)
// ==========================================================================

// State Management
const state = {
  format: 'format-a', // 'format-a' (PFP Overlay) or 'format-b' (Builder Pass)
  theme: 'goa-emerald', // 'goa-emerald', 'sunset-gold', 'cyber-lime', 'royal-pink'
  frame: 'classic-arch', // 'classic-arch', 'tropical-wave', 'golden-laurel', 'minimal-sleek', 'vintage-stamp'
  image: null,
  panX: 0,
  panY: 0,
  scale: 1,
  rotate: 0,
  brightness: 100,
  contrast: 100,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  
  // Format B Builder Data
  name: 'Team No More Tokens',
  stack: 'Rust • AI • Fullstack',
  handle: 'no_more_tokens',
  title: 'AI & Web3 Sorcerer',

  // Background Public Image CDN URL
  publicImageUrl: null
};

// Preload Goa Frame Image Assets
const palmsFrameImg = new Image();
palmsFrameImg.src = './frame-goa-palms.png';
palmsFrameImg.onload = () => { if (typeof renderCanvas === 'function') renderCanvas(); };

const anjunaRaveFrameImg = new Image();
anjunaRaveFrameImg.src = './frame-anjuna-rave.png';
anjunaRaveFrameImg.onload = () => { if (typeof renderCanvas === 'function') renderCanvas(); };



// Builder Titles List for Generator
const FUN_TITLES = [
  "Solana Rust Sorcerer",
  "Zero-Knowledge Alchemist",
  "AI & Web3 Sorcerer",
  "Full-Stack Beach Nomad",
  "Prompt Engineer & Chai Enthusiast",
  "DeFi Liquidity Wizard",
  "Anjuna Cyber Hacker",
  "Goa Sun-Powered Buidler",
  "Smart Contract Whisperer",
  "On-Chain Pulse Master",
  "Autonomous Agent Architect",
  "Palm Tree Protocol Engineer",
  "High-Frequency Chai Sipper"
];

// Color Palettes per Theme (Grounded in Official Poster)
const THEMES = {
  'goa-emerald': {
    bg: '#08381D',
    cardBg: '#094826',
    gold: '#F5CE15',
    pink: '#E6007E',
    greenLight: '#167D44',
    textDark: '#041B0E'
  },
  'sunset-gold': {
    bg: '#331B00',
    cardBg: '#4A2800',
    gold: '#FFB800',
    pink: '#FF0055',
    greenLight: '#FFA800',
    textDark: '#1F1000'
  },
  'cyber-lime': {
    bg: '#042218',
    cardBg: '#083D2B',
    gold: '#00FFA3',
    pink: '#FF007A',
    greenLight: '#00D68F',
    textDark: '#02120C'
  },
  'royal-pink': {
    bg: '#2A0419',
    cardBg: '#4A082E',
    gold: '#FFD700',
    pink: '#FF1493',
    greenLight: '#FF69B4',
    textDark: '#1A0210'
  }
};

// DOM Element References
const canvas = document.getElementById('graphicCanvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.getElementById('canvasWrapper');
const uploadArea = document.getElementById('uploadArea');
const photoInput = document.getElementById('photoInput');
const resIndicator = document.getElementById('resIndicator');

// Inputs
const inputName = document.getElementById('inputName');
const inputStack = document.getElementById('inputStack');
const inputHandle = document.getElementById('inputHandle');
const inputTitle = document.getElementById('inputTitle');
const btnRandomTitle = document.getElementById('btnRandomTitle');

// Adjustments
const zoomRange = document.getElementById('zoomRange');
const rotateRange = document.getElementById('rotateRange');
const brightnessRange = document.getElementById('brightnessRange');
const contrastRange = document.getElementById('contrastRange');
const btnAutoCenter = document.getElementById('btnAutoCenter');
const btnAutoCenterCanvas = document.getElementById('btnAutoCenterCanvas');
const btnResetAdjust = document.getElementById('btnResetAdjust');

// Buttons
const tabFormatA = document.getElementById('tabFormatA');
const tabFormatB = document.getElementById('tabFormatB');
const formatBFields = document.getElementById('formatBFields');
const btnDownload = document.getElementById('btnDownload');
const btnShareX = document.getElementById('btnShareX');
const btnCopyCaption = document.getElementById('btnCopyCaption');
const btnCopyPublicLink = document.getElementById('btnCopyPublicLink');
const captionPreviewText = document.getElementById('captionPreviewText');

// Initialize Default User Avatar Image
function initDefaultImage() {
  const img = new Image();
  img.onload = () => {
    state.image = img;
    renderCanvas();
  };
  img.src = './default-avatar.png?v=' + Date.now();
}

// Event Listeners Setup
function setupEventListeners() {
  tabFormatA.addEventListener('click', () => setFormat('format-a'));
  tabFormatB.addEventListener('click', () => setFormat('format-b'));

  document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.theme-chip').forEach(c => c.classList.remove('active'));
      const btn = e.currentTarget;
      btn.classList.add('active');
      state.theme = btn.dataset.theme;
      renderCanvas();
    });
  });

  document.querySelectorAll('.frame-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.frame-chip').forEach(c => c.classList.remove('active'));
      const btn = e.currentTarget;
      btn.classList.add('active');
      state.frame = btn.dataset.frame;
      renderCanvas();
    });
  });

  photoInput.addEventListener('change', handleFileUpload);

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  inputName.addEventListener('input', (e) => { state.name = e.target.value; updateCaption(); renderCanvas(); });
  inputStack.addEventListener('input', (e) => { state.stack = e.target.value; renderCanvas(); });
  inputHandle.addEventListener('input', (e) => { state.handle = e.target.value.replace(/^@/, ''); updateCaption(); renderCanvas(); });
  inputTitle.addEventListener('input', (e) => { state.title = e.target.value; updateCaption(); renderCanvas(); });

  btnRandomTitle.addEventListener('click', () => {
    const randomTitle = FUN_TITLES[Math.floor(Math.random() * FUN_TITLES.length)];
    inputTitle.value = randomTitle;
    state.title = randomTitle;
    updateCaption();
    renderCanvas();
  });

  zoomRange.addEventListener('input', (e) => { 
    const zoomVal = parseFloat(e.target.value);
    state.scale = 1 + (zoomVal / 100); 
    clampPan(); 
    renderCanvas(); 
  });
  rotateRange.addEventListener('input', (e) => { state.rotate = parseInt(e.target.value); renderCanvas(); });
  brightnessRange.addEventListener('input', (e) => { state.brightness = parseInt(e.target.value); renderCanvas(); });
  contrastRange.addEventListener('input', (e) => { state.contrast = parseInt(e.target.value); renderCanvas(); });

  // Individual Parameter Resets
  const btnResetZoom = document.getElementById('btnResetZoom');
  const btnResetRotate = document.getElementById('btnResetRotate');
  const btnResetBrightness = document.getElementById('btnResetBrightness');
  const btnResetContrast = document.getElementById('btnResetContrast');

  if (btnResetZoom) btnResetZoom.addEventListener('click', () => { state.scale = 1; zoomRange.value = 0; clampPan(); renderCanvas(); });
  if (btnResetRotate) btnResetRotate.addEventListener('click', () => { state.rotate = 0; rotateRange.value = 0; renderCanvas(); });
  if (btnResetBrightness) btnResetBrightness.addEventListener('click', () => { state.brightness = 100; brightnessRange.value = 100; renderCanvas(); });
  if (btnResetContrast) btnResetContrast.addEventListener('click', () => { state.contrast = 100; contrastRange.value = 100; renderCanvas(); });

  const triggerAutoCenter = (targetBtn) => {
    state.panX = 0;
    state.panY = 0;
    state.rotate = 0;
    state.scale = 1;
    zoomRange.value = 0;
    rotateRange.value = 0;
    renderCanvas();
    
    if (targetBtn) {
      const origHtml = targetBtn.innerHTML;
      targetBtn.innerHTML = '<i class="fa-solid fa-check"></i> Centered!';
      setTimeout(() => {
        targetBtn.innerHTML = origHtml;
      }, 1500);
    }
  };

  if (btnAutoCenter) btnAutoCenter.addEventListener('click', () => triggerAutoCenter(btnAutoCenter));
  if (btnAutoCenterCanvas) btnAutoCenterCanvas.addEventListener('click', () => triggerAutoCenter(btnAutoCenterCanvas));

  btnResetAdjust.addEventListener('click', () => {
    state.scale = 1;
    state.rotate = 0;
    state.brightness = 100;
    state.contrast = 100;
    state.panX = 0;
    state.panY = 0;
    
    zoomRange.value = 0;
    rotateRange.value = 0;
    brightnessRange.value = 100;
    contrastRange.value = 100;
    renderCanvas();
  });

  canvasWrapper.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', endDrag);

  canvasWrapper.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', drag, { passive: false });
  window.addEventListener('touchend', endDrag);

  btnDownload.addEventListener('click', downloadCanvas);
  btnShareX.addEventListener('click', shareToX);
  btnCopyCaption.addEventListener('click', copyCaption);
  if (btnCopyPublicLink) {
    btnCopyPublicLink.addEventListener('click', copyPublicImageLink);
  }
}

// Switch Format
function setFormat(format) {
  state.format = format;
  if (format === 'format-a') {
    tabFormatA.classList.add('active');
    tabFormatB.classList.remove('active');
    formatBFields.classList.add('hidden');
    canvas.width = 800;
    canvas.height = 800;
    canvasWrapper.classList.add('format-a');
    canvasWrapper.classList.remove('format-b');
    canvasWrapper.style.aspectRatio = '800 / 800';
    resIndicator.textContent = '800 × 800 px (PFP)';
  } else {
    tabFormatB.classList.add('active');
    tabFormatA.classList.remove('active');
    formatBFields.classList.remove('hidden');
    canvas.width = 1080;
    canvas.height = 1350;
    canvasWrapper.classList.add('format-b');
    canvasWrapper.classList.remove('format-a');
    canvasWrapper.style.aspectRatio = '1080 / 1350';
    resIndicator.textContent = '1080 × 1350 px (Pass)';
  }
  updateCaption();
  renderCanvas();
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

async function processFile(file) {
  let imageFile = file;

  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try {
      uploadArea.querySelector('.upload-text').innerHTML = 'Converting HEIC photo...';
      const convertedBlob = await heic2any({ blob: file, toType: "image/png" });
      imageFile = convertedBlob;
    } catch (err) {
      console.error("HEIC error:", err);
      alert("Failed to convert HEIC. Please upload a JPG or PNG.");
      return;
    }
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      state.panX = 0;
      state.panY = 0;
      state.scale = 1;
      zoomRange.value = 0;
      renderCanvas();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(imageFile);
}

function isPointInsidePhotoArea(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (clientX - rect.left) * scaleX;
  const canvasY = (clientY - rect.top) * scaleY;

  if (state.format === 'format-a') {
    const circleX = canvas.width / 2;
    const circleY = 425;
    const radius = 295;
    const dx = canvasX - circleX;
    const dy = canvasY - circleY;
    return (dx * dx + dy * dy) <= (radius * radius);
  } else {
    const photoW = 620;
    const photoH = 620;
    const photoX = (canvas.width - photoW) / 2;
    const photoY = 250;
    return canvasX >= photoX && canvasX <= (photoX + photoW) &&
           canvasY >= photoY && canvasY <= (photoY + photoH);
  }
}

function startDrag(e) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  if (!isPointInsidePhotoArea(clientX, clientY)) {
    return;
  }

  state.isDragging = true;
  state.dragStartX = clientX - state.panX;
  state.dragStartY = clientY - state.panY;
}

function clampPan() {
  if (!state.image) return;

  const imgW = state.image.width;
  const imgH = state.image.height;
  const aspect = imgW / imgH;

  let frameW, frameH;
  if (state.format === 'format-a') {
    const radius = 295;
    frameW = radius * 2;
    frameH = radius * 2;
  } else {
    frameW = 620;
    frameH = 620;
  }

  let drawW = frameW;
  let drawH = drawW / aspect;
  if (drawH < frameH) {
    drawH = frameH;
    drawW = drawH * aspect;
  }

  const scaledW = drawW * state.scale;
  const scaledH = drawH * state.scale;

  const maxPanX = Math.max(0, (scaledW - frameW) / 2);
  const maxPanY = Math.max(0, (scaledH - frameH) / 2);

  state.panX = Math.min(maxPanX, Math.max(-maxPanX, state.panX));
  state.panY = Math.min(maxPanY, Math.max(-maxPanY, state.panY));
}

function drag(e) {
  if (!state.isDragging) return;
  if (e.cancelable) e.preventDefault();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  state.panX = clientX - state.dragStartX;
  state.panY = clientY - state.dragStartY;
  clampPan();
  renderCanvas();
}

function endDrag() {
  state.isDragging = false;
}

// Master Render Function
function renderCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.format === 'format-a') {
    renderFormatA();
  } else {
    renderFormatB();
  }

  // Trigger background CDN auto-upload for instant X preview card
  triggerBackgroundSync();
}

// ==========================================================================
// FORMAT A: PFP FRAME OVERLAY (800x800) matching Official Poster Theme
// ==========================================================================
function renderFormatA() {
  const theme = THEMES[state.theme];
  const size = 800;

  // Emerald Deep Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, size, size);

  // Save State for Circle Photo Mask
  ctx.save();
  const circleX = size / 2;
  const circleY = 420;
  const radius = 290;

  ctx.beginPath();
  ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
  ctx.clip();

  // Draw Uploaded Photo
  if (state.image) {
    ctx.save();
    ctx.translate(circleX + state.panX, circleY + state.panY);
    ctx.rotate((state.rotate * Math.PI) / 180);
    ctx.scale(state.scale, state.scale);
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%)`;

    const imgW = state.image.width;
    const imgH = state.image.height;
    const aspect = imgW / imgH;
    
    let drawW = radius * 2;
    let drawH = drawW / aspect;
    if (drawH < radius * 2) {
      drawH = radius * 2;
      drawW = drawH * aspect;
    }

    ctx.drawImage(state.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
  ctx.restore();

  // Draw Outer Polka-Dot Poster Frame or Custom Frame Overlay
  drawSelectedFrameA(ctx, size, size, theme, radius, state.frame, circleX, circleY);

  // Top Location Header: "GOA, INDIA" (Positioned at y=50 with generous breathing room clear of frame)
  ctx.save();
  ctx.fillStyle = theme.gold;
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOA, INDIA', size / 2, 50);
  ctx.restore();

  // Bottom Center Title Badge: "HACKER HOUSE" + Pink "गोवा" + Dates
  drawOfficialBrandedBadge(ctx, size / 2, size - 75, theme);
}

// ==========================================================================
// FORMAT B: BUILDER ID PASS (1080x1350) matching Official Poster Theme
// ==========================================================================
function renderFormatB() {
  const theme = THEMES[state.theme];
  const width = 1080;
  const height = 1350;

  // Background Fill
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Outer Card Border matching selected frame style
  drawOuterCardBorderB(ctx, width, height, theme, state.frame);

  // Outer Ornate Card Border
  ctx.save();
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 6;
  drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 28);
  ctx.stroke();
  ctx.restore();

  // Top Header Banner (Arched Theme Box)
  ctx.save();
  ctx.fillStyle = theme.cardBg;
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 48, 48, width - 96, 175, 24);
  ctx.fill();
  ctx.stroke();

  // Header Subtitle: "GOA, INDIA"
  ctx.fillStyle = theme.gold;
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOA, INDIA', width / 2, 86);

  // Title: "HACKER HOUSE" with Devanagari "गोवा"
  ctx.font = '900 46px "Outfit", sans-serif';
  ctx.fillStyle = theme.gold;
  ctx.fillText('HACKER HOUSE', width / 2 - 35, 138);

  // Hot Pink "गोवा" overlay badge
  ctx.save();
  ctx.fillStyle = theme.pink;
  ctx.font = '900 44px "Rozha One", serif, "Outfit"';
  ctx.shadowColor = theme.pink;
  ctx.shadowBlur = 10;
  ctx.fillText('गोवा', width / 2 + 195, 138);
  ctx.restore();

  // Date Subhead
  ctx.fillStyle = theme.gold;
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText('28 - 31 OCT 2026', width / 2, 184);
  ctx.restore();

  // Photo Container (620x620)
  const photoW = 620;
  const photoH = 620;
  const photoX = (width - photoW) / 2;
  const photoY = 250;
  const cx = photoX + photoW / 2;
  const cy = photoY + photoH / 2;

  ctx.save();
  if (state.frame === 'goa-sunset-palms') {
    ctx.beginPath();
    ctx.arc(cx, cy, 270, 0, Math.PI * 2);
    ctx.clip();

  } else {
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24);
    ctx.clip();
  }

  if (state.image) {
    ctx.save();
    ctx.translate(cx + state.panX, cy + state.panY);
    ctx.rotate((state.rotate * Math.PI) / 180);
    ctx.scale(state.scale, state.scale);
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%)`;

    const imgW = state.image.width;
    const imgH = state.image.height;
    const aspect = imgW / imgH;
    
    let drawW = photoW;
    let drawH = drawW / aspect;
    if (drawH < photoH) {
      drawH = photoH;
      drawW = drawH * aspect;
    }

    ctx.drawImage(state.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
  ctx.restore();

  // Photo Frame Border matching frame style
  drawSelectedFrameB(ctx, width, height, theme, photoX, photoY, photoW, photoH, state.frame, cx, cy);

  // Builder Details Block
  const textCenter = width / 2;

  // Name
  ctx.fillStyle = theme.gold;
  ctx.font = '900 52px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.name || 'Anonymous Builder', textCenter, 930);

  // Builder Title (Pink)
  ctx.save();
  ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.pink;
  ctx.fillText(state.title || 'Beach Buidler', textCenter, 975);
  ctx.restore();

  // Stack & Skills Pill
  ctx.save();
  ctx.fillStyle = 'rgba(245, 206, 21, 0.1)';
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 2;
  const stackW = Math.max(360, ctx.measureText(state.stack || 'Fullstack').width + 70);
  drawRoundedRect(ctx, textCenter - stackW / 2, 1005, stackW, 50, 25);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillText(state.stack || 'Rust • AI • Web3', textCenter, 1038);
  ctx.restore();

  // Handle
  ctx.fillStyle = theme.gold;
  ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`@${state.handle || 'buidler_goa'}`, textCenter, 1100);

  // Barcode Visual (Enlarged)
  drawBarcode(ctx, textCenter - 290, 1140, 580, 80, theme.gold);

  // Footer Hashtag
  ctx.fillStyle = theme.pink;
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText('#FrameInGoa • Official Builder Pass', textCenter, 1285);
}

// Draw Outer Polka-Dot Frame Matching Poster
function drawPolkaDotBorder(ctx, w, h, goldColor, pinkColor) {
  ctx.save();
  // Outer Yellow Border Strip
  ctx.fillStyle = goldColor;
  const borderWidth = 18;
  
  ctx.fillRect(0, 0, w, borderWidth);
  ctx.fillRect(0, h - borderWidth, w, borderWidth);
  ctx.fillRect(0, 0, borderWidth, h);
  ctx.fillRect(w - borderWidth, 0, borderWidth, h);

  // Polka Dots (Pink) inside Yellow Border
  ctx.fillStyle = pinkColor;
  const dotRadius = 3.5;
  const dotSpacing = 16;

  for (let x = dotSpacing / 2; x < w; x += dotSpacing) {
    ctx.beginPath();
    ctx.arc(x, borderWidth / 2, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, h - borderWidth / 2, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let y = dotSpacing / 2; y < h; y += dotSpacing) {
    ctx.beginPath();
    ctx.arc(borderWidth / 2, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(w - borderWidth / 2, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Ornate Arched Frame Matching Official Poster
function drawOfficialArchedFrame(ctx, w, h, theme, radius, circleX, circleY) {
  ctx.save();
  const cx = circleX || w / 2;
  const cy = circleY || h / 2;

  // Outer Arched Ring in Gold
  ctx.lineWidth = 14;
  ctx.strokeStyle = theme.gold;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
  ctx.stroke();

  // Inner White Dotted Line Ring
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#FFFFFF';
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}



// Draw Official Branded Title Badge (HACKER HOUSE + pink "गोवा")
function drawOfficialBrandedBadge(ctx, x, y, theme) {
  ctx.save();
  ctx.fillStyle = theme.cardBg;
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 3;

  drawRoundedRect(ctx, x - 220, y - 40, 440, 75, 20);
  ctx.fill();
  ctx.stroke();

  // Text: "HACKER HOUSE"
  ctx.fillStyle = theme.gold;
  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HACKER HOUSE', x - 20, y - 5);

  // Hot Pink "गोवा" superimposed badge
  ctx.fillStyle = theme.pink;
  ctx.font = '900 26px "Rozha One", serif, "Outfit"';
  ctx.fillText('गोवा', x + 120, y - 5);

  // Subtext: Dates
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillText('28 - 31 OCT 2026 • #FrameInGoa', x, y + 22);

  ctx.restore();
}

// Utilities
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBarcode(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;

  let currentX = x;
  const pattern = [3, 1, 4, 1, 2, 5, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 5, 1, 2];
  const unit = w / pattern.reduce((a, b) => a + b, 0);

  pattern.forEach((widthUnits, i) => {
    if (i % 2 === 0) {
      ctx.fillRect(currentX, y, widthUnits * unit, h);
    }
    currentX += widthUnits * unit;
  });

  ctx.restore();
}

function downloadCanvas() {
  const filename = state.format === 'format-a' 
    ? 'hh-goa-2026-pfp.png' 
    : `hh-goa-2026-pass-${(state.name || 'builder').toLowerCase().replace(/\s+/g, '-')}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

function shareToX(e) {
  showToast('🚀 Opening X tweet composer with your graphic preview card!');
}

let syncDebounceTimer = null;

function triggerBackgroundSync() {
  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncPublicImageLink();
  }, 400);
}

async function syncPublicImageLink() {
  try {
    const filename = state.format === 'format-a' ? 'hh-goa-pfp.png' : 'hh-goa-pass.png';
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
    if (!blob) return;

    const formData = new FormData();
    formData.append('file', blob, filename);

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data && data.status === 'success' && data.data && data.data.url) {
      state.publicImageUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      updateCaption();
    }
  } catch (err) {
    console.log('Background CDN sync error:', err);
  }
}

function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

function updateCaption() {
  let text = '';
  if (state.format === 'format-a') {
    text = `Just generated my official @HackerHouseGoa 2026 PFP! 🌴🚀 Ready to build in Goa! (28-31 Oct 2026) #FrameInGoa #HackerHouseGoa`;
  } else {
    text = `Claimed my @HackerHouseGoa 2026 Builder Pass as "${state.title || 'Buidler'}"! 🌴⚡ See you in Goa! @${state.handle || 'buidler_goa'} #FrameInGoa #HackerHouseGoa`;
  }
  captionPreviewText.textContent = text;
  if (btnShareX) {
    const origin = window.location.origin;
    const ogEndpoint = `${origin}/api/og?format=${state.format}&theme=${state.theme}&frame=${state.frame}&name=${encodeURIComponent(state.name || '')}&title=${encodeURIComponent(state.title || '')}&handle=${encodeURIComponent(state.handle || '')}`;
    const shareUrl = state.publicImageUrl || ogEndpoint;
    btnShareX.href = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  }
}

function copyCaption() {
  const text = captionPreviewText.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    btnCopyCaption.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(() => {
      btnCopyCaption.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
    }, 2000);
  });
}

async function copyPublicImageLink() {
  if (!btnCopyPublicLink) return;
  const originalHtml = btnCopyPublicLink.innerHTML;
  btnCopyPublicLink.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Public Link...';
  
  showToast('⚡ Uploading graphic for public HTTPS preview link...');

  try {
    const filename = state.format === 'format-a' ? 'hh-goa-pfp.png' : 'hh-goa-pass.png';
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
    
    const formData = new FormData();
    formData.append('file', blob, filename);

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data && data.status === 'success' && data.data && data.data.url) {
      const publicImageUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      
      await navigator.clipboard.writeText(publicImageUrl);
      
      btnCopyPublicLink.innerHTML = '<i class="fa-solid fa-check"></i> Public Link Copied!';
      showToast('🔗 Direct public image URL copied to clipboard! Paste or open link anywhere to preview your graphic.');
      
      setTimeout(() => {
        btnCopyPublicLink.innerHTML = originalHtml;
      }, 3500);
      return;
    }
  } catch (err) {
    console.log('Public image link upload error:', err);
  }

  btnCopyPublicLink.innerHTML = originalHtml;
  showToast('⚠️ Could not generate public link. Download PNG directly!');
}

// ==========================================================================
// FRAME RENDERING DISPATCHERS & CUSTOM FRAME STYLES
// ==========================================================================

// Master Frame Renderer for Format A (PFP 800x800)
function drawSelectedFrameA(ctx, w, h, theme, radius, frameStyle, circleX, circleY) {
  const cx = circleX || w / 2;
  const cy = circleY || h / 2;

  switch (frameStyle) {
    case 'goa-sunset-palms':
      drawGoaSunsetPalmsFrameA(ctx, w, h, theme, radius, cx, cy);
      break;
    case 'anjuna-neon-rave':
      drawAnjunaNeonRaveFrameA(ctx, w, h, theme, radius, cx, cy);
      break;
    case 'vintage-stamp':
      drawVintageStampFrameA(ctx, w, h, theme, radius, cx, cy);
      break;
    case 'classic-arch':
    default:
      drawPolkaDotBorder(ctx, w, h, theme.gold, theme.pink);
      drawOfficialArchedFrame(ctx, w, h, theme, radius, cx, cy);
      break;
  }
}

// Outer Card Border Dispatcher for Format B
function drawOuterCardBorderB(ctx, w, h, theme, frameStyle) {
  switch (frameStyle) {
    case 'vintage-stamp':
      drawStampBorderCanvas(ctx, w, h, theme.gold, theme.bg);
      break;
    case 'classic-arch':
    case 'goa-sunset-palms':
    case 'anjuna-neon-rave':
    default:
      drawPolkaDotBorder(ctx, w, h, theme.gold, theme.pink);
      break;
  }
}

// Master Frame Renderer for Format B (Builder Pass 1080x1350)
function drawSelectedFrameB(ctx, w, h, theme, photoX, photoY, photoW, photoH, frameStyle, cx, cy) {
  switch (frameStyle) {
    case 'goa-sunset-palms':
      drawGoaSunsetPalmsFrameB(ctx, w, h, theme, photoX, photoY, photoW, photoH, cx, cy);
      break;
    case 'anjuna-neon-rave':
      drawAnjunaNeonRaveFrameB(ctx, w, h, theme, photoX, photoY, photoW, photoH);
      break;
    case 'vintage-stamp':
      drawVintageStampFrameB(ctx, w, h, theme, photoX, photoY, photoW, photoH);
      break;
    case 'classic-arch':
    default:
      ctx.save();
      ctx.lineWidth = 6;
      ctx.strokeStyle = theme.gold;
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24);
      ctx.stroke();
      ctx.restore();
      break;
  }
}



// 5. VINTAGE STAMP FRAME (Format A)
function drawVintageStampFrameA(ctx, w, h, theme, radius, cx, cy) {
  // Scalloped Stamp Outer Canvas Border (Chipped edge postal stamp)
  drawStampBorderCanvas(ctx, w, h, theme.gold, theme.bg);

  ctx.save();
  // Perforated Circular Photo Stamp Border
  const numPerf = 28;
  ctx.fillStyle = theme.gold;
  for (let i = 0; i < numPerf; i++) {
    const angle = (i / numPerf) * Math.PI * 2;
    const px = cx + (radius + 14) * Math.cos(angle);
    const py = cy + (radius + 14) * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner Dotted Line
  ctx.strokeStyle = theme.pink;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

// VINTAGE STAMP FRAME (Format B)
function drawVintageStampFrameB(ctx, w, h, theme, photoX, photoY, photoW, photoH) {
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = theme.gold;
  ctx.setLineDash([8, 8]);
  drawRoundedRect(ctx, photoX - 6, photoY - 6, photoW + 12, photoH + 12, 16);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = theme.pink;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 12);
  ctx.stroke();
  ctx.restore();
}

// Helper: Palm Frond
function drawPalmFrond(ctx, x, y, color, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(30, -20, 60, -10);
  ctx.stroke();

  for (let i = 1; i <= 5; i++) {
    const offset = i * 10;
    ctx.beginPath();
    ctx.moveTo(offset, -offset / 2);
    ctx.lineTo(offset + 12, -offset / 2 - 18);
    ctx.stroke();
  }
  ctx.restore();
}

// Helper: Laurel Arc
function drawLaurelArc(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  const leftAngles = [Math.PI * 0.6, Math.PI * 0.7, Math.PI * 0.8, Math.PI * 0.9];
  leftAngles.forEach(ang => {
    const lx = cx + r * Math.cos(ang);
    const ly = cy + r * Math.sin(ang);
    ctx.beginPath();
    ctx.ellipse(lx, ly, 8, 4, ang + Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  });

  const rightAngles = [Math.PI * 0.1, Math.PI * 0.2, Math.PI * 0.3, Math.PI * 0.4];
  rightAngles.forEach(ang => {
    const rx = cx + r * Math.cos(ang);
    const ry = cy + r * Math.sin(ang);
    ctx.beginPath();
    ctx.ellipse(rx, ry, 8, 4, ang - Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// Helper: Stamp Border for Canvas (Chipped Serrated Postal Stamp Edges)
function drawStampBorderCanvas(ctx, w, h, borderColor, bgFill) {
  ctx.save();
  const borderWidth = 20;

  // 1. Solid Outer Frame Strip
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, w, borderWidth);
  ctx.fillRect(0, h - borderWidth, w, borderWidth);
  ctx.fillRect(0, 0, borderWidth, h);
  ctx.fillRect(w - borderWidth, 0, borderWidth, h);

  // 2. Cut out semi-circle teeth along outer edges (y=0, y=h, x=0, x=w)
  ctx.fillStyle = bgFill || '#062413';
  const notchRadius = 7;
  const step = 20;

  // Top Edge Chipped Notches
  for (let x = step / 2; x < w; x += step) {
    ctx.beginPath();
    ctx.arc(x, 0, notchRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bottom Edge Chipped Notches
  for (let x = step / 2; x < w; x += step) {
    ctx.beginPath();
    ctx.arc(x, h, notchRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  // Left Edge Chipped Notches
  for (let y = step / 2; y < h; y += step) {
    ctx.beginPath();
    ctx.arc(0, y, notchRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  // Right Edge Chipped Notches
  for (let y = step / 2; y < h; y += step) {
    ctx.beginPath();
    ctx.arc(w, y, notchRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Inner Dotted Perforated Line along border interior
  ctx.strokeStyle = '#E6007E';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(borderWidth + 3, borderWidth + 3, w - (borderWidth * 2 + 6), h - (borderWidth * 2 + 6));
  ctx.setLineDash([]);

  ctx.restore();
}

// ==========================================================================
// DEDICATED GOA-THEMED FRAME IMPLEMENTATIONS
// ==========================================================================

// 6. GOA SUNSET PALMS FRAME (Format A)
function drawGoaSunsetPalmsFrameA(ctx, w, h, theme, radius, cx, cy) {
  drawPolkaDotBorder(ctx, w, h, theme.gold, theme.pink);

  ctx.save();
  if (palmsFrameImg.complete && palmsFrameImg.naturalWidth !== 0) {
    const frameDim = (radius + 45) * 2;
    ctx.drawImage(palmsFrameImg, cx - frameDim / 2, cy - frameDim / 2, frameDim, frameDim);
  } else {
    // Fallback if image loading
    ctx.lineWidth = 8;
    ctx.strokeStyle = theme.gold;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// GOA SUNSET PALMS FRAME (Format B)
function drawGoaSunsetPalmsFrameB(ctx, w, h, theme, photoX, photoY, photoW, photoH, cx, cy) {
  ctx.save();
  if (palmsFrameImg.complete && palmsFrameImg.naturalWidth !== 0) {
    const frameDim = 640;
    const centerPointX = cx || (photoX + photoW / 2);
    const centerPointY = cy || (photoY + photoH / 2);
    ctx.drawImage(palmsFrameImg, centerPointX - frameDim / 2, centerPointY - frameDim / 2, frameDim, frameDim);
  } else {
    ctx.lineWidth = 6;
    ctx.strokeStyle = theme.gold;
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24);
    ctx.stroke();
  }
  ctx.restore();
}

// 7. ANJUNA NEON RAVE FRAME (Format A)
function drawAnjunaNeonRaveFrameA(ctx, w, h, theme, radius, cx, cy) {
  ctx.save();
  // Neon Cyber Outer Frame
  ctx.strokeStyle = '#00F5FF';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Soundwave Equalizer Bars in 4 Corners
  drawEqualizerBars(ctx, 30, 30, theme.pink);
  drawEqualizerBars(ctx, w - 90, 30, '#00F5FF');
  drawEqualizerBars(ctx, 30, h - 50, '#00F5FF');
  drawEqualizerBars(ctx, w - 90, h - 50, theme.pink);

  // Psytrance Neon Pulsing Ring Overlay
  ctx.strokeStyle = '#00F5FF';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#00F5FF';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = theme.pink;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.pink;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 22, 0, Math.PI * 2);
  ctx.stroke();

  // 12 Glowing Starburst Frequency Dots along Arc
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const dx = cx + (radius + 22) * Math.cos(angle);
    const dy = cy + (radius + 22) * Math.sin(angle);
    ctx.fillStyle = i % 2 === 0 ? theme.gold : '#00F5FF';
    ctx.beginPath();
    ctx.arc(dx, dy, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ANJUNA NEON RAVE FRAME (Format B)
function drawAnjunaNeonRaveFrameB(ctx, w, h, theme, photoX, photoY, photoW, photoH) {
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#00F5FF';
  ctx.shadowColor = '#00F5FF';
  ctx.shadowBlur = 14;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 20);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = theme.pink;
  ctx.shadowColor = theme.pink;
  drawRoundedRect(ctx, photoX + 8, photoY + 8, photoW - 16, photoH - 16, 14);
  ctx.stroke();
  ctx.restore();
}



// Helper: Full Coconut Palm Tree
function drawFullCoconutPalm(ctx, x, y, color, scaleFactor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleFactor < 0 ? -1 : 1, Math.abs(scaleFactor));
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3.5;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(0, 80);
  ctx.quadraticCurveTo(-15, 20, -5, -60);
  ctx.stroke();

  // Leaves
  const leaves = [-0.8, -0.4, 0, 0.4, 0.8];
  leaves.forEach(angle => {
    ctx.save();
    ctx.translate(-5, -60);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-25, -20, -50, -10);
    ctx.stroke();

    for (let i = 1; i <= 6; i++) {
      const pos = i * 7;
      ctx.beginPath();
      ctx.moveTo(-pos, -pos / 3);
      ctx.lineTo(-pos - 8, -pos / 3 + 12);
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.restore();
}

// Helper: Equalizer Bars for Anjuna Psy Rave
function drawEqualizerBars(ctx, x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  const heights = [18, 28, 14, 34, 22, 10];
  heights.forEach((h, i) => {
    ctx.fillRect(x + i * 8, y + (35 - h), 5, h);
  });
  ctx.restore();
}

// Helper: Azulejos Tile Corner Pattern
function drawTileCorner(ctx, x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y);
  ctx.moveTo(x, y - 12); ctx.lineTo(x, y + 12);
  ctx.stroke();
  ctx.restore();
}

// Helper: Azulejos Border Canvas Pattern
function drawAzulejosBorderCanvas(ctx, w, h, goldColor, bgFill, pinkColor) {
  ctx.save();
  const bw = 20;

  // Outer Border Strips
  ctx.fillStyle = goldColor;
  ctx.fillRect(0, 0, w, bw);
  ctx.fillRect(0, h - bw, w, bw);
  ctx.fillRect(0, 0, bw, h);
  ctx.fillRect(w - bw, 0, bw, h);

  // Geometric Azulejos Diamond Tiles inside border
  ctx.fillStyle = pinkColor;
  const step = 20;

  for (let x = step / 2; x < w; x += step) {
    drawDiamond(ctx, x, bw / 2, 5, pinkColor);
    drawDiamond(ctx, x, h - bw / 2, 5, pinkColor);
  }
  for (let y = step / 2; y < h; y += step) {
    drawDiamond(ctx, bw / 2, y, 5, pinkColor);
    drawDiamond(ctx, w - bw / 2, y, 5, pinkColor);
  }
  ctx.restore();
}

function drawDiamond(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setFormat(state.format);
  initDefaultImage();
  updateCaption();
});
