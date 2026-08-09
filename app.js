// ==========================================================================
// HACKER HOUSE GOA 2026 — OFFICIAL POSTER GRAPHIC ENGINE (app.js)
// ==========================================================================

// State Management
const state = {
  format: 'format-a', // 'format-a' (PFP Overlay) or 'format-b' (Builder Pass)
  theme: 'goa-emerald', // 'goa-emerald', 'sunset-gold', 'cyber-lime', 'royal-pink'
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
  title: 'AI & Web3 Sorcerer'
};

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

  zoomRange.addEventListener('input', (e) => { state.scale = parseFloat(e.target.value); renderCanvas(); });
  rotateRange.addEventListener('input', (e) => { state.rotate = parseInt(e.target.value); renderCanvas(); });
  brightnessRange.addEventListener('input', (e) => { state.brightness = parseInt(e.target.value); renderCanvas(); });
  contrastRange.addEventListener('input', (e) => { state.contrast = parseInt(e.target.value); renderCanvas(); });

  const triggerAutoCenter = (targetBtn) => {
    state.panX = 0;
    state.panY = 0;
    state.rotate = 0;
    state.scale = 1;
    zoomRange.value = 1;
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
    
    zoomRange.value = 1;
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
    resIndicator.textContent = '800 × 800 px (PFP)';
  } else {
    tabFormatB.classList.add('active');
    tabFormatA.classList.remove('active');
    formatBFields.classList.remove('hidden');
    canvas.width = 1080;
    canvas.height = 1350;
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
      zoomRange.value = 1;
      renderCanvas();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(imageFile);
}

function startDrag(e) {
  state.isDragging = true;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  state.dragStartX = clientX - state.panX;
  state.dragStartY = clientY - state.panY;
}

function drag(e) {
  if (!state.isDragging) return;
  e.preventDefault();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  state.panX = clientX - state.dragStartX;
  state.panY = clientY - state.dragStartY;
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
  const circleY = size / 2;
  const radius = 330;

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
    
    let drawW = radius * 2 * 1.1;
    let drawH = drawW / aspect;
    if (drawH < radius * 2 * 1.1) {
      drawH = radius * 2 * 1.1;
      drawW = drawH * aspect;
    }

    ctx.drawImage(state.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
  ctx.restore();

  // Draw Outer Polka-Dot Poster Frame
  drawPolkaDotBorder(ctx, size, size, theme.gold, theme.pink);

  // Draw Ornate Arched Frame Overlay
  drawOfficialArchedFrame(ctx, size, size, theme, radius);

  // Top Location Header: "GOA, INDIA"
  ctx.save();
  ctx.fillStyle = theme.gold;
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOA, INDIA', size / 2, 70);
  ctx.restore();

  // Bottom Center Title Badge: "HACKER HOUSE" + Pink "गोवा" + Dates
  drawOfficialBrandedBadge(ctx, size / 2, size - 110, theme);
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

  // Polka Dot Outer Frame
  drawPolkaDotBorder(ctx, width, height, theme.gold, theme.pink);

  // Outer Ornate Card Border
  ctx.save();
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 8;
  drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 32);
  ctx.stroke();
  ctx.restore();

  // Top Header Banner (Arched Theme Box)
  ctx.save();
  ctx.fillStyle = theme.cardBg;
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 70, 70, width - 140, 160, 24);
  ctx.fill();
  ctx.stroke();

  // Header Subtitle: "GOA, INDIA"
  ctx.fillStyle = theme.gold;
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOA, INDIA', width / 2, 105);

  // Title: "HACKER HOUSE" with Devanagari "गोवा"
  ctx.font = '900 42px "Outfit", sans-serif';
  ctx.fillStyle = theme.gold;
  ctx.fillText('HACKER HOUSE', width / 2 - 30, 155);

  // Hot Pink "गोवा" overlay badge
  ctx.save();
  ctx.fillStyle = theme.pink;
  ctx.font = '900 40px "Rozha One", serif, "Outfit"';
  ctx.shadowColor = theme.pink;
  ctx.shadowBlur = 10;
  ctx.fillText('गोवा', width / 2 + 180, 155);
  ctx.restore();

  // Date Subhead
  ctx.fillStyle = theme.gold;
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText('28 - 31 OCT 2026', width / 2, 195);
  ctx.restore();

  // Photo Container
  const photoX = (width - 540) / 2;
  const photoY = 260;
  const photoW = 540;
  const photoH = 540;

  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24);
  ctx.clip();

  if (state.image) {
    ctx.save();
    ctx.translate(photoX + photoW / 2 + state.panX, photoY + photoH / 2 + state.panY);
    ctx.rotate((state.rotate * Math.PI) / 180);
    ctx.scale(state.scale, state.scale);
    ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%)`;

    const imgW = state.image.width;
    const imgH = state.image.height;
    const aspect = imgW / imgH;
    
    let drawW = photoW * 1.1;
    let drawH = drawW / aspect;
    if (drawH < photoH * 1.1) {
      drawH = photoH * 1.1;
      drawW = drawH * aspect;
    }

    ctx.drawImage(state.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
  ctx.restore();

  // Photo Frame Ornate Border
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = theme.gold;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24);
  ctx.stroke();

  // Ornate Gold Corner Flourishes around Photo
  drawCornerFlourishes(ctx, photoX, photoY, photoW, photoH, theme.gold, theme.pink);
  ctx.restore();

  // Builder Details Block
  const textCenter = width / 2;

  // Name
  ctx.fillStyle = theme.gold;
  ctx.font = '900 48px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.name || 'Anonymous Builder', textCenter, 860);

  // Builder Title (Pink)
  ctx.save();
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.pink;
  ctx.fillText(state.title || 'Beach Buidler', textCenter, 905);
  ctx.restore();

  // Stack & Skills Pill
  ctx.save();
  ctx.fillStyle = 'rgba(245, 206, 21, 0.1)';
  ctx.strokeStyle = theme.gold;
  ctx.lineWidth = 2;
  const stackW = Math.max(320, ctx.measureText(state.stack || 'Fullstack').width + 60);
  drawRoundedRect(ctx, textCenter - stackW / 2, 935, stackW, 46, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText(state.stack || 'Rust • AI • Web3', textCenter, 965);
  ctx.restore();

  // Handle
  ctx.fillStyle = theme.gold;
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`@${state.handle || 'buidler_goa'}`, textCenter, 1020);

  // Barcode Visual
  drawBarcode(ctx, textCenter - 260, 1060, 520, 70, theme.gold);

  // Footer Hashtag
  ctx.fillStyle = theme.pink;
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText('#FrameInGoa • Official Builder Pass', textCenter, 1180);
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
function drawOfficialArchedFrame(ctx, w, h, theme, radius) {
  ctx.save();
  const cx = w / 2;
  const cy = h / 2;

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

  // Top Floral Flourish Motifs (Gold & Pink Lotus)
  drawLotusMotif(ctx, cx, cy - radius - 20, theme.pink, theme.gold);
  drawLotusMotif(ctx, cx - radius, cy, theme.pink, theme.gold);
  drawLotusMotif(ctx, cx + radius, cy, theme.pink, theme.gold);
  drawLotusMotif(ctx, cx, cy + radius + 20, theme.pink, theme.gold);

  ctx.restore();
}

function drawLotusMotif(ctx, x, y, pinkColor, goldColor) {
  ctx.save();
  ctx.fillStyle = pinkColor;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = goldColor;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCornerFlourishes(ctx, x, y, w, h, goldColor, pinkColor) {
  ctx.save();
  ctx.fillStyle = pinkColor;
  
  // Top Left
  ctx.beginPath(); ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2); ctx.fill();
  // Top Right
  ctx.beginPath(); ctx.arc(x + w - 10, y + 10, 8, 0, Math.PI * 2); ctx.fill();
  // Bottom Left
  ctx.beginPath(); ctx.arc(x + 10, y + h - 10, 8, 0, Math.PI * 2); ctx.fill();
  // Bottom Right
  ctx.beginPath(); ctx.arc(x + w - 10, y + h - 10, 8, 0, Math.PI * 2); ctx.fill();

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

function shareToX() {
  const caption = captionPreviewText.textContent.trim();
  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(caption)}`;
  window.open(tweetUrl, '_blank', 'noopener,noreferrer');
}

function updateCaption() {
  let text = '';
  if (state.format === 'format-a') {
    text = `Just generated my official @HackerHouseGoa 2026 PFP! 🌴🚀 Ready to build in Goa! (28-31 Oct 2026) #FrameInGoa #HackerHouseGoa`;
  } else {
    text = `Claimed my @HackerHouseGoa 2026 Builder Pass as "${state.title || 'Buidler'}"! 🌴⚡ See you in Goa! @${state.handle || 'buidler_goa'} #FrameInGoa #HackerHouseGoa`;
  }
  captionPreviewText.textContent = text;
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

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initDefaultImage();
  updateCaption();
});
