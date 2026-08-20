<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>BlackBoard Pro Max</title>
  
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#ffffff">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="BlackBoard">

  <!-- PDF.js Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --primary: #2563eb;
      --glass-bg: rgba(255, 255, 255, 0.96);
      --glass-border: rgba(255, 255, 255, 0.6);
      --glass-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.35);
      --text-main: #1e293b;
      --text-muted: #64748b;
    }

    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
      user-select: none; 
      font-family: 'Inter', sans-serif; 
      -webkit-tap-highlight-color: transparent; 
    }
    
    html, body {
      width: 100vw; 
      height: 100vh; 
      overflow: hidden;
      background-color: #0f172a; 
      color: var(--text-main);
      touch-action: none;
    }

    #board-wrapper { 
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw; 
      height: 100vh; 
      overflow: auto; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      padding: 20px 8px 120px 8px;
      background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
      -webkit-overflow-scrolling: touch;
      cursor: default;
      z-index: 1;
    }
    #board-wrapper.hand-active { cursor: grab !important; }
    #board-wrapper.hand-grabbing { cursor: grabbing !important; }

    #pdf-render-container { 
      display: flex; 
      flex-direction: column; 
      gap: 20px; 
      align-items: center; 
      transform-origin: top center;
      transition: transform 0.05s ease-out;
      width: 100%;
    }

    .page-wrapper {
      position: relative; 
      width: 900px;
      height: 580px;
      max-width: calc(100vw - 16px);
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.7);
      border-radius: 12px; 
      background: #ffffff;
      flex-shrink: 0;
      overflow: hidden;
    }

    canvas { 
      display: block; 
      position: absolute; 
      top: 0; 
      left: 0; 
      width: 100% !important; 
      height: 100% !important; 
      border-radius: 12px; 
    }
    .pdf-canvas-layer { z-index: 1; pointer-events: none; }
    .draw-canvas-layer { z-index: 2; pointer-events: auto; touch-action: none; background: transparent; }

    .board-text-input {
      position: absolute; 
      z-index: 9999; 
      min-width: 150px; 
      min-height: 40px;
      padding: 8px 12px; 
      border-radius: 8px; 
      border: 2px dashed #2563eb;
      background: #ffffff; 
      outline: none;
      font-weight: 600; 
      font-size: 18px;
      color: #0f172a;
      cursor: text; 
      user-select: text;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25); 
      line-height: 1.4;
      white-space: pre-wrap; 
      word-break: break-word;
    }

    .bg-white { background-color: #ffffff !important; }
    .bg-yellow { background-color: #fef9c3 !important; }
    .bg-blue { background-color: #eff6ff !important; }
    .bg-greenboard { background-color: #064e3b !important; }
    .bg-dark { background-color: #1a1a1a !important; }
    .bg-grid-white { 
      background-color: #ffffff !important; 
      background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px) !important;
      background-size: 20px 20px !important;
    }

    .glass-pill {
      background: var(--glass-bg); 
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px); 
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow); 
      border-radius: 16px;
    }

    /* Desktop Left Toolbar */
    #sidebar-container {
      position: fixed; 
      top: 14px; 
      left: 14px; 
      z-index: 999999;
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      gap: 8px;
      width: 46px;
    }

    #eye-btn {
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      color: var(--primary);
      border: 1px solid var(--glass-border); 
      display: flex; 
      align-items: center;
      justify-content: center; 
      font-size: 16px; 
      cursor: pointer;
      flex-shrink: 0;
    }

    #main-toolbar {
      width: 46px; 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      padding: 8px 0; 
      gap: 4px;
      max-height: 82vh; 
      overflow-y: auto; 
      overflow-x: hidden;
      flex-shrink: 0;
    }
    #main-toolbar::-webkit-scrollbar { display: none; }

    .ui-hidden { display: none !important; }

    .t-btn {
      background: transparent; 
      color: var(--text-muted); 
      border: none; 
      width: 36px; 
      height: 36px; 
      border-radius: 10px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      font-size: 15px; 
      cursor: pointer; 
      transition: 0.15s ease;
      flex-shrink: 0;
    }
    .t-btn:hover { background: rgba(37, 99, 235, 0.12); color: var(--primary); }
    .t-btn.active { 
      background: var(--primary) !important; 
      color: #ffffff !important; 
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); 
    }

    .separator { 
      width: 20px; 
      height: 1px; 
      background: rgba(0, 0, 0, 0.1); 
      margin: 2px 0; 
      flex-shrink: 0; 
    }

    /* Popups */
    .pop-panel {
      position: fixed; 
      top: 60px; 
      left: 70px; 
      z-index: 999998; 
      min-width: 220px; 
      padding: 10px; 
      display: none; 
      flex-direction: column; 
      gap: 8px;
    }
    .pop-panel.open { display: flex; }

    .pop-title {
      font-size: 11px; 
      font-weight: 700; 
      color: var(--text-muted); 
      text-transform: uppercase;
      padding: 0 2px;
    }

    .pop-item {
      display: flex; 
      align-items: center; 
      gap: 10px; 
      padding: 8px 10px; 
      border-radius: 8px;
      color: var(--text-main); 
      font-size: 13px; 
      font-weight: 500; 
      cursor: pointer;
    }
    .pop-item:hover { background: rgba(37, 99, 235, 0.12); color: var(--primary); }

    /* WORKING CALCULATOR POPUP */
    #calc-panel {
      position: fixed;
      top: 60px;
      left: 70px;
      z-index: 999999;
      width: 240px;
      padding: 12px;
      display: none;
      flex-direction: column;
      gap: 8px;
      pointer-events: auto;
    }
    #calc-panel.open { display: flex; }

    .calc-screen {
      width: 100%;
      height: 40px;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      text-align: right;
      padding: 6px 12px;
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      outline: none;
    }
    .calc-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .calc-btn {
      padding: 10px 0;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.1s;
    }
    .calc-btn:hover { background: #f1f5f9; }
    .calc-btn:active { transform: scale(0.95); background: #e2e8f0; }
    .calc-btn.op-btn { background: #eff6ff; color: var(--primary); font-weight: 700; }
    .calc-btn.eq-btn { background: var(--primary); color: #ffffff; grid-column: span 2; font-weight: 700; }
    .calc-btn.c-btn { background: #fee2e2; color: #ef4444; font-weight: 700; }

    .stamp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
    .stamp-btn { 
      font-size: 20px; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px; 
      background: #fff; 
      padding: 6px 2px; 
      cursor: pointer; 
      text-align: center; 
      transition: 0.15s;
    }
    .stamp-btn:hover { background: #eff6ff; border-color: var(--primary); }
    .stamp-btn.active-stamp { border-color: var(--primary); background: #dbeafe; }

    .stroke-slider-wrap { padding: 4px 6px; display: flex; flex-direction: column; gap: 6px; }
    .stroke-slider-wrap span { font-size: 11px; font-weight: 600; color: var(--text-muted); }
    .stroke-slider-wrap input { width: 100%; cursor: pointer; }

    #bottom-dock {
      position: fixed; 
      bottom: 16px; 
      left: 50%; 
      transform: translateX(-50%); 
      z-index: 999998; 
      padding: 6px 14px; 
      display: flex; 
      gap: 8px; 
      align-items: center;
    }

    input[type="color"] { 
      border: 2px solid #ffffff; 
      width: 24px; 
      height: 24px; 
      border-radius: 50%; 
      cursor: pointer; 
      background: none; 
      flex-shrink: 0; 
    }
    input[type="file"] { display: none; }

    /* Mobile Responsive Layout */
    body.is-mobile #board-wrapper {
      padding: 55px 6px 90px 6px !important;
    }
    body.is-mobile .page-wrapper {
      width: 100% !important;
      height: 72vh !important;
      max-width: 100% !important;
    }
    body.is-mobile #sidebar-container {
      top: auto !important; 
      bottom: 12px !important; 
      left: 50% !important; 
      right: auto !important;
      transform: translateX(-50%) !important;
      width: calc(100vw - 16px) !important;
      max-width: 500px !important;
      flex-direction: row !important; 
      justify-content: space-between !important;
      gap: 6px !important;
    }
    body.is-mobile #main-toolbar {
      flex-direction: row !important; 
      width: calc(100% - 46px) !important; 
      max-width: none !important;
      height: 48px !important; 
      padding: 0 6px !important; 
      overflow-x: auto !important; 
      overflow-y: hidden !important;
      gap: 6px !important;
    }
    body.is-mobile .separator { 
      width: 1px !important; 
      height: 22px !important; 
      margin: 0 2px !important; 
    }
    body.is-mobile #bottom-dock {
      top: 10px !important; 
      bottom: auto !important; 
      right: 10px !important; 
      left: auto !important; 
      transform: none !important; 
      padding: 4px 8px !important;
    }
    body.is-mobile .pop-panel,
    body.is-mobile #calc-panel {
      top: auto !important; 
      bottom: 68px !important; 
      left: 10px !important; 
      right: 10px !important;
      min-width: auto !important;
      max-height: 52vh !important;
      overflow-y: auto !important;
    }
  </style>
</head>
<body>

  <div id="board-wrapper">
    <div id="pdf-render-container">
      <div class="page-wrapper bg-white" data-page="1">
        <canvas class="draw-canvas-layer"></canvas>
      </div>
    </div>
  </div>

  <div id="sidebar-container">
    <button id="eye-btn" class="glass-pill" title="Toggle Dock"><i class="fa-solid fa-eye"></i></button>

    <div id="main-toolbar" class="glass-pill">
      <button class="t-btn" id="btn-hand" title="Hand Tool (Pan View)"><i class="fa-solid fa-hand"></i></button>
      <button class="t-btn active" id="btn-pen" title="Fine Pen"><i class="fa-solid fa-pen-nib"></i></button>
      <button class="t-btn" id="btn-highlighter" title="Highlighter"><i class="fa-solid fa-highlighter"></i></button>
      <button class="t-btn" id="btn-brush" title="Paint Brush" style="color: #ec4899;"><i class="fa-solid fa-paintbrush"></i></button>
      <button class="t-btn" id="btn-text" title="Text Note" style="color: #0284c7;"><i class="fa-solid fa-font"></i></button>
      <button class="t-btn" id="btn-stamp-trigger" title="Stamps" style="color: #10b981;"><i class="fa-solid fa-stamp"></i></button>
      <button class="t-btn" id="btn-calc-trigger" title="Calculator" style="color: #8b5cf6;"><i class="fa-solid fa-calculator"></i></button>
      <button class="t-btn" id="btn-eraser" title="Eraser"><i class="fa-solid fa-eraser"></i></button>

      <div class="separator"></div>

      <button class="t-btn" id="btn-add-sheet" title="Add Blank Sheet" style="color: #10b981;"><i class="fa-solid fa-file-circle-plus"></i></button>
      <label class="t-btn" for="pdf-input" title="Browse PDF Document" style="color: #ef4444;"><i class="fa-solid fa-file-pdf"></i></label>
      <input type="file" id="pdf-input" accept="application/pdf">
      <label class="t-btn" for="image-input" title="Insert Image" style="color: #0284c7;"><i class="fa-solid fa-image"></i></label>
      <input type="file" id="image-input" accept="image/*">
      <button class="t-btn" id="btn-shapes-trigger" title="Shapes"><i class="fa-solid fa-shapes"></i></button>

      <div class="separator"></div>

      <button class="t-btn" id="btn-stroke-trigger" title="Pen/Brush Size"><i class="fa-solid fa-sliders"></i></button>
      <input type="color" id="pen-color" value="#2563eb" title="Pen Color">
      <button class="t-btn" id="btn-bg-trigger" title="Board Theme"><i class="fa-solid fa-palette"></i></button>

      <div class="separator"></div>

      <button class="t-btn" id="btn-undo" title="Undo"><i class="fa-solid fa-rotate-left"></i></button>
      <button class="t-btn" id="btn-export" title="Save Board Image"><i class="fa-solid fa-download"></i></button>
      <button class="t-btn" id="btn-clear" title="Clear Board" style="color: #ef4444;"><i class="fa-solid fa-trash-can"></i></button>
    </div>
  </div>

  <!-- Calculator Popup -->
  <div class="glass-pill" id="calc-panel">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
      <span class="pop-title"><i class="fa-solid fa-calculator" style="margin-right: 4px;"></i> Calculator</span>
      <i class="fa-solid fa-xmark" id="close-calc-btn" style="cursor: pointer; font-size: 15px; color: #94a3b8; padding: 4px;"></i>
    </div>
    <input type="text" class="calc-screen" id="calc-display" readonly value="0">
    <div class="calc-grid">
      <button class="calc-btn c-btn" data-val="C">C</button>
      <button class="calc-btn op-btn" data-val="÷">÷</button>
      <button class="calc-btn op-btn" data-val="×">×</button>
      <button class="calc-btn op-btn" data-val="-">−</button>
      
      <button class="calc-btn" data-val="7">7</button>
      <button class="calc-btn" data-val="8">8</button>
      <button class="calc-btn" data-val="9">9</button>
      <button class="calc-btn op-btn" data-val="+">+</button>
      
      <button class="calc-btn" data-val="4">4</button>
      <button class="calc-btn" data-val="5">5</button>
      <button class="calc-btn" data-val="6">6</button>
      <button class="calc-btn op-btn" data-val="%">%</button>
      
      <button class="calc-btn" data-val="1">1</button>
      <button class="calc-btn" data-val="2">2</button>
      <button class="calc-btn" data-val="3">3</button>
      <button class="calc-btn" data-val=".">.</button>
      
      <button class="calc-btn" data-val="0">0</button>
      <button class="calc-btn" data-val="00">00</button>
      <button class="calc-btn eq-btn" id="calc-equals-btn">=</button>
    </div>
  </div>

  <!-- Stamp Panel -->
  <div class="pop-panel glass-pill" id="stamp-panel">
    <span class="pop-title">Grading Badges</span>
    <div class="stamp-grid">
      <button class="stamp-btn active-stamp" data-stamp="⭐">⭐</button>
      <button class="stamp-btn" data-stamp="✅">✅</button>
      <button class="stamp-btn" data-stamp="❌">❌</button>
      <button class="stamp-btn" data-stamp="💯">💯</button>
      <button class="stamp-btn" data-stamp="🎯">🎯</button>
      <button class="stamp-btn" data-stamp="👏">👏</button>
      <button class="stamp-btn" data-stamp="🏆">🏆</button>
      <button class="stamp-btn" data-stamp="🥇">🥇</button>
    </div>
    <span class="pop-title" style="margin-top: 4px;">Reactions</span>
    <div class="stamp-grid">
      <button class="stamp-btn" data-stamp="🔥">🔥</button>
      <button class="stamp-btn" data-stamp="💡">💡</button>
      <button class="stamp-btn" data-stamp="📌">📌</button>
      <button class="stamp-btn" data-stamp="🚀">🚀</button>
      <button class="stamp-btn" data-stamp="👍">👍</button>
      <button class="stamp-btn" data-stamp="❤️">❤️</button>
      <button class="stamp-btn" data-stamp="❓">❓</button>
      <button class="stamp-btn" data-stamp="❗">❗</button>
    </div>
  </div>

  <!-- Thickness Flyout -->
  <div class="pop-panel glass-pill" id="stroke-panel">
    <div class="stroke-slider-wrap">
      <span id="stroke-label">Thickness: 4px</span>
      <input type="range" id="brush-size" min="1" max="40" value="4">
    </div>
  </div>

  <!-- Shapes Panel -->
  <div class="pop-panel glass-pill" id="shapes-panel">
    <div class="pop-item" data-action="rect"><i class="fa-regular fa-square"></i> Rectangle</div>
    <div class="pop-item" data-action="circle"><i class="fa-regular fa-circle"></i> Circle</div>
    <div class="pop-item" data-action="line"><i class="fa-solid fa-minus"></i> Line</div>
    <div class="pop-item" data-action="arrow"><i class="fa-solid fa-arrow-right"></i> Arrow</div>
  </div>

  <!-- Board Themes -->
  <div class="pop-panel glass-pill" id="bg-panel">
    <div class="pop-item" data-bg="white"><i class="fa-solid fa-circle" style="color: #cbd5e1;"></i> Pure White</div>
    <div class="pop-item" data-bg="yellow"><i class="fa-solid fa-circle" style="color: #fef08a;"></i> Pastel Yellow</div>
    <div class="pop-item" data-bg="blue"><i class="fa-solid fa-circle" style="color: #bfdbfe;"></i> Pastel Blue</div>
    <div class="pop-item" data-bg="grid-white"><i class="fa-solid fa-border-all" style="color: #64748b;"></i> Dot Grid</div>
    <div class="pop-item" data-bg="greenboard"><i class="fa-solid fa-chalkboard" style="color: #064e3b;"></i> Chalk Green</div>
    <div class="pop-item" data-bg="dark"><i class="fa-solid fa-circle" style="color: #1a1a1a;"></i> Deep Charcoal</div>
  </div>

  <!-- Zoom Dock -->
  <div id="bottom-dock" class="glass-pill">
    <button class="t-btn" id="zoom-out"><i class="fa-solid fa-minus"></i></button>
    <span id="zoom-text" style="font-size: 11px; font-weight: 700; color: var(--text-main); min-width: 36px; text-align: center;">100%</span>
    <button class="t-btn" id="zoom-in"><i class="fa-solid fa-plus"></i></button>
  </div>

  <script>
    function checkAndApplyDeviceLayout() {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isNarrow = window.innerWidth <= 960;
      if (isTouch || isNarrow) {
        document.body.classList.add('is-mobile');
      } else {
        document.body.classList.remove('is-mobile');
      }
    }
    checkAndApplyDeviceLayout();

    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    let currentScale = 1.0;
    let currentTool = 'pen'; 
    let currentShape = 'none';
    let currentBg = 'white';
    let currentStamp = '⭐';
    let brushThickness = 4;
    let activeCanvas = null;
    let isDrawing = false;
    let startX = 0, startY = 0;
    let lastX = 0, lastY = 0;
    let snapshot = null;
    const historyMap = new WeakMap();

    const boardWrapper = document.getElementById('board-wrapper');
    let isPanning = false;
    let panStartX = 0, panStartY = 0;
    let scrollLeft = 0, scrollTop = 0;

    let isPinching = false;
    let initialPinchDist = 0;
    let initialScale = 1.0;
    let pinchMidX = 0, pinchMidY = 0;

    const renderContainer = document.getElementById('pdf-render-container');
    const mainToolbar = document.getElementById('main-toolbar');
    const bottomDock = document.getElementById('bottom-dock');
    const eyeBtn = document.getElementById('eye-btn');
    const shapesPanel = document.getElementById('shapes-panel');
    const bgPanel = document.getElementById('bg-panel');
    const strokePanel = document.getElementById('stroke-panel');
    const stampPanel = document.getElementById('stamp-panel');
    const calcPanel = document.getElementById('calc-panel');

    // UI Toggles
    eyeBtn.addEventListener('click', () => {
      const isHidden = mainToolbar.classList.toggle('ui-hidden');
      closeAllPanels();
      eyeBtn.querySelector('i').className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    function closeAllPanels() {
      shapesPanel.classList.remove('open');
      bgPanel.classList.remove('open');
      strokePanel.classList.remove('open');
      stampPanel.classList.remove('open');
      calcPanel.classList.remove('open');
    }
    document.addEventListener('click', () => closeAllPanels());

    // ISOLATED ROBUST CALCULATOR ENGINE
    calcPanel.addEventListener('click', (e) => e.stopPropagation());
    calcPanel.addEventListener('mousedown', (e) => e.stopPropagation());
    calcPanel.addEventListener('touchstart', (e) => e.stopPropagation());

    document.getElementById('btn-calc-trigger').addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = calcPanel.classList.contains('open');
      closeAllPanels();
      if (!isOpen) calcPanel.classList.add('open');
    });

    document.getElementById('close-calc-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      calcPanel.classList.remove('open');
    });

    const calcDisplay = document.getElementById('calc-display');
    let isCalculated = false;

    document.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = btn.getAttribute('data-val');
        if (!val) return; // Equals button handled separately

        if (val === 'C') {
          calcDisplay.value = '0';
          isCalculated = false;
          return;
        }

        if (isCalculated && !['+', '-', '×', '÷', '%'].includes(val)) {
          calcDisplay.value = val;
          isCalculated = false;
          return;
        }
        isCalculated = false;

        if (calcDisplay.value === '0' && val !== '.') {
          calcDisplay.value = val;
        } else {
          calcDisplay.value += val;
        }
      });
    });

    document.getElementById('calc-equals-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      try {
        let expr = calcDisplay.value;
        expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
        
        // Secure Calculation
        const result = Function(`'use strict'; return (${expr})`)();
        calcDisplay.value = Number.isFinite(result) ? (Math.round(result * 100000000) / 100000000).toString() : 'Error';
        isCalculated = true;
      } catch (err) {
        calcDisplay.value = 'Error';
        isCalculated = true;
      }
    });

    document.getElementById('btn-stroke-trigger').addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = strokePanel.classList.contains('open');
      closeAllPanels();
      if (!isOpen) strokePanel.classList.add('open');
    });

    document.getElementById('brush-size').addEventListener('input', (e) => {
      brushThickness = parseInt(e.target.value);
      document.getElementById('stroke-label').innerText = `Thickness: ${brushThickness}px`;
    });

    function setActiveTool(toolName, btnElement) {
      document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
      currentTool = toolName;
      if (btnElement) btnElement.classList.add('active');
      currentShape = 'none';
      boardWrapper.classList.toggle('hand-active', currentTool === 'hand');
    }

    document.getElementById('btn-hand').addEventListener('click', (e) => setActiveTool('hand', e.currentTarget));
    document.getElementById('btn-pen').addEventListener('click', (e) => setActiveTool('pen', e.currentTarget));
    document.getElementById('btn-highlighter').addEventListener('click', (e) => setActiveTool('highlighter', e.currentTarget));
    document.getElementById('btn-brush').addEventListener('click', (e) => setActiveTool('brush', e.currentTarget));
    document.getElementById('btn-eraser').addEventListener('click', (e) => setActiveTool('eraser', e.currentTarget));
    document.getElementById('btn-text').addEventListener('click', (e) => setActiveTool('text', e.currentTarget));

    // Stamps Picker
    document.getElementById('btn-stamp-trigger').addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = stampPanel.classList.contains('open');
      closeAllPanels();
      if (!isOpen) stampPanel.classList.add('open');
    });

    document.querySelectorAll('.stamp-btn').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.stamp-btn').forEach(s => s.classList.remove('active-stamp'));
        b.classList.add('active-stamp');
        currentStamp = b.getAttribute('data-stamp');
        setActiveTool('stamp', document.getElementById('btn-stamp-trigger'));
        closeAllPanels();
      });
    });

    // Shapes Flyout
    document.getElementById('btn-shapes-trigger').addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = shapesPanel.classList.contains('open');
      closeAllPanels();
      if (!isOpen) shapesPanel.classList.add('open');
    });

    document.querySelectorAll('#shapes-panel .pop-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentShape = item.getAttribute('data-action');
        currentTool = 'shape';
        document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-shapes-trigger').classList.add('active');
        closeAllPanels();
      });
    });

    // Background Selector
    document.getElementById('btn-bg-trigger').addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = bgPanel.classList.contains('open');
      closeAllPanels();
      if (!isOpen) bgPanel.classList.add('open');
    });

    document.querySelectorAll('#bg-panel .pop-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        currentBg = item.getAttribute('data-bg');
        document.querySelectorAll('.page-wrapper').forEach(w => {
          w.className = `page-wrapper bg-${currentBg}`;
        });
        closeAllPanels();
      });
    });

    // Hand Tool Mouse Panning
    boardWrapper.addEventListener('mousedown', (e) => {
      if (currentTool !== 'hand') return;
      isPanning = true;
      boardWrapper.classList.add('hand-grabbing');
      panStartX = e.pageX - boardWrapper.offsetLeft;
      panStartY = e.pageY - boardWrapper.offsetTop;
      scrollLeft = boardWrapper.scrollLeft;
      scrollTop = boardWrapper.scrollTop;
    });

    boardWrapper.addEventListener('mousemove', (e) => {
      if (!isPanning || currentTool !== 'hand') return;
      e.preventDefault();
      const x = e.pageX - boardWrapper.offsetLeft;
      const y = e.pageY - boardWrapper.offsetTop;
      boardWrapper.scrollLeft = scrollLeft - (x - panStartX);
      boardWrapper.scrollTop = scrollTop - (y - panStartY);
    });

    window.addEventListener('mouseup', () => {
      isPanning = false;
      boardWrapper.classList.remove('hand-grabbing');
    });

    // SAFE CANVAS SETUP
    function setupPage(pageWrapper, preserveContent = true) {
      const canvas = pageWrapper.querySelector('.draw-canvas-layer');
      const dpr = Math.max(window.devicePixelRatio || 1, 2.5);
      const rect = pageWrapper.getBoundingClientRect();
      const baseW = rect.width / currentScale;
      const baseH = rect.height / currentScale;

      const targetWidth = Math.round(baseW * dpr);
      const targetHeight = Math.round(baseH * dpr);

      if (canvas.width === targetWidth && canvas.height === targetHeight) {
        return;
      }

      let backupCanvas = null;
      if (preserveContent && canvas.width > 0 && canvas.height > 0) {
        backupCanvas = document.createElement('canvas');
        backupCanvas.width = canvas.width;
        backupCanvas.height = canvas.height;
        backupCanvas.getContext('2d').drawImage(canvas, 0, 0);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      if (backupCanvas) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(backupCanvas, 0, 0);
        ctx.restore();
      }

      if (!historyMap.has(canvas)) {
        historyMap.set(canvas, []);
      }
      activeCanvas = canvas;
      attachDrawing(canvas, pageWrapper);
    }

    document.getElementById('btn-add-sheet').addEventListener('click', () => {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = `page-wrapper bg-${currentBg}`;
      pageWrapper.innerHTML = `<canvas class="draw-canvas-layer"></canvas>`;
      renderContainer.appendChild(pageWrapper);
      setupPage(pageWrapper, false);
      pageWrapper.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('image-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && activeCanvas) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const img = new Image();
          img.onload = function() {
            const ctx = activeCanvas.getContext('2d');
            const maxW = Math.min(300, (activeCanvas.width / (window.devicePixelRatio || 1)) * 0.7);
            const scale = maxW / img.width;
            const targetW = img.width * scale;
            const targetH = img.height * scale;
            ctx.drawImage(img, 30, 30, targetW, targetH);
            saveHistory(activeCanvas);
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // PDF Import
    document.getElementById('pdf-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function() {
          const typedarray = new Uint8Array(this.result);
          pdfjsLib.getDocument(typedarray).promise.then(doc => {
            renderContainer.innerHTML = '';
            const dpr = Math.max(window.devicePixelRatio || 1, 2.5);

            for (let i = 1; i <= doc.numPages; i++) {
              doc.getPage(i).then(page => {
                const viewport = page.getViewport({ scale: 1.0 });
                const hdViewport = page.getViewport({ scale: 1.0 * dpr });

                const pageWrapper = document.createElement('div');
                pageWrapper.className = 'page-wrapper';
                pageWrapper.style.width = `${viewport.width}px`;
                pageWrapper.style.height = `${viewport.height}px`;

                const pCanvas = document.createElement('canvas');
                pCanvas.className = 'pdf-canvas-layer';
                pCanvas.width = hdViewport.width;
                pCanvas.height = hdViewport.height;
                const pCtx = pCanvas.getContext('2d');

                const dCanvas = document.createElement('canvas');
                dCanvas.className = 'draw-canvas-layer';
                dCanvas.width = hdViewport.width;
                dCanvas.height = hdViewport.height;
                const dCtx = dCanvas.getContext('2d');
                dCtx.scale(dpr, dpr);

                pageWrapper.appendChild(pCanvas);
                pageWrapper.appendChild(dCanvas);
                renderContainer.appendChild(pageWrapper);

                page.render({ 
                  canvasContext: pCtx, 
                  viewport: hdViewport 
                });

                historyMap.set(dCanvas, []);
                activeCanvas = dCanvas;
                attachDrawing(dCanvas, pageWrapper);
              });
            }
          });
        };
        reader.readAsArrayBuffer(file);
      }
    });

    // Inline Text Tool
    function createInlineTextBox(wrapper, canvas, x, y) {
      const existing = wrapper.querySelector('.board-text-input');
      if (existing) existing.remove();

      const textEl = document.createElement('div');
      textEl.className = 'board-text-input';
      textEl.contentEditable = "true";
      textEl.style.left = `${x}px`;
      textEl.style.top = `${y}px`;
      
      const chosenColor = document.getElementById('pen-color').value;
      textEl.style.color = (chosenColor === '#ffffff' && (currentBg === 'white' || currentBg === 'yellow')) ? '#0f172a' : chosenColor;

      wrapper.appendChild(textEl);
      
      setTimeout(() => {
        textEl.focus();
      }, 50);

      let isCommitted = false;
      function finalizeText() {
        if (isCommitted) return;
        isCommitted = true;

        const text = textEl.innerText.trim();
        if (text) {
          const ctx = canvas.getContext('2d');
          const lines = text.split('\n');
          
          ctx.save();
          ctx.font = `600 18px Inter, sans-serif`;
          ctx.fillStyle = textEl.style.color;
          ctx.textBaseline = "top";

          lines.forEach((line, index) => {
            ctx.fillText(line, x + 8, y + 8 + (index * 24));
          });
          
          ctx.restore();
          saveHistory(canvas);
        }

        if (textEl.parentNode) {
          textEl.remove();
        }
      }

      textEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          finalizeText();
        }
      });

      textEl.addEventListener('blur', finalizeText);
    }

    function saveHistory(canvas) {
      const history = historyMap.get(canvas) || [];
      const ctx = canvas.getContext('2d');
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (history.length > 20) history.shift();
      historyMap.set(canvas, history);
    }

    document.getElementById('btn-undo').addEventListener('click', () => {
      if (!activeCanvas) return;
      const history = historyMap.get(activeCanvas);
      if (history && history.length > 1) {
        history.pop();
        const prev = history[history.length - 1];
        activeCanvas.getContext('2d').putImageData(prev, 0, 0);
      } else if (activeCanvas) {
        activeCanvas.getContext('2d').clearRect(0, 0, activeCanvas.width, activeCanvas.height);
      }
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      document.querySelectorAll('.draw-canvas-layer').forEach(c => {
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
        historyMap.set(c, []);
      });
      document.querySelectorAll('.board-text-input').forEach(t => t.remove());
    });

    function applyZoom(delta) {
      const newScale = currentScale + delta;
      if (newScale >= 0.3 && newScale <= 3.5) {
        currentScale = Math.round(newScale * 100) / 100;
        renderContainer.style.transform = `scale(${currentScale})`;
        document.getElementById('zoom-text').textContent = `${Math.round(currentScale * 100)}%`;
      }
    }

    document.getElementById('zoom-in').addEventListener('click', () => applyZoom(0.15));
    document.getElementById('zoom-out').addEventListener('click', () => applyZoom(-0.15));

    document.getElementById('btn-export').addEventListener('click', () => {
      const page = document.querySelector('.page-wrapper');
      if (!page) return;
      const drawCanvas = page.querySelector('.draw-canvas-layer');
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = drawCanvas.width;
      tempCanvas.height = drawCanvas.height;
      const tCtx = tempCanvas.getContext('2d');

      tCtx.fillStyle = currentBg === 'yellow' ? '#fef9c3' : (currentBg === 'dark' ? '#1a1a1a' : (currentBg === 'greenboard' ? '#064e3b' : '#ffffff'));
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      const pdfCanvas = page.querySelector('.pdf-canvas-layer');
      if (pdfCanvas) tCtx.drawImage(pdfCanvas, 0, 0);
      tCtx.drawImage(drawCanvas, 0, 0);

      const link = document.createElement('a');
      link.download = `blackboard-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL();
      link.click();
    });

    function getTouchDistance(t1, t2) {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }

    function getTouchMidpoint(t1, t2) {
      return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
    }

    // Touch & Drawing Engine
    function attachDrawing(canvas, wrapper) {
      const ctx = canvas.getContext('2d');

      function getPos(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return {
          x: (clientX - rect.left) / currentScale,
          y: (clientY - rect.top) / currentScale
        };
      }

      function handleTouchStart(e) {
        if (e.touches.length === 2) {
          isDrawing = false;
          isPinching = true;
          initialPinchDist = getTouchDistance(e.touches[0], e.touches[1]);
          initialScale = currentScale;
          const mid = getTouchMidpoint(e.touches[0], e.touches[1]);
          pinchMidX = mid.x;
          pinchMidY = mid.y;
          scrollLeft = boardWrapper.scrollLeft;
          scrollTop = boardWrapper.scrollTop;
          return;
        }

        if (e.touches.length === 1) {
          if (currentTool === 'hand') {
            isPanning = true;
            panStartX = e.touches[0].pageX - boardWrapper.offsetLeft;
            panStartY = e.touches[0].pageY - boardWrapper.offsetTop;
            scrollLeft = boardWrapper.scrollLeft;
            scrollTop = boardWrapper.scrollTop;
            return;
          }

          if (e.cancelable) e.preventDefault();
          activeCanvas = canvas;
          const pos = getPos(e.touches[0].clientX, e.touches[0].clientY);
          startX = pos.x; startY = pos.y;
          lastX = pos.x; lastY = pos.y;

          if (currentTool === 'stamp') {
            ctx.font = `32px Arial, sans-serif`;
            ctx.fillText(currentStamp, pos.x - 16, pos.y + 16);
            saveHistory(canvas);
            return;
          }

          if (currentTool === 'text') {
            createInlineTextBox(wrapper, canvas, pos.x, pos.y);
            return;
          }

          isDrawing = true;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      }

      function handleTouchMove(e) {
        if (isPinching && e.touches.length === 2) {
          if (e.cancelable) e.preventDefault();
          
          const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
          const scaleDiff = (currentDist / initialPinchDist);
          const targetScale = Math.min(Math.max(initialScale * scaleDiff, 0.4), 3.5);
          
          currentScale = Math.round(targetScale * 100) / 100;
          renderContainer.style.transform = `scale(${currentScale})`;
          document.getElementById('zoom-text').textContent = `${Math.round(currentScale * 100)}%`;

          const currentMid = getTouchMidpoint(e.touches[0], e.touches[1]);
          const dx = currentMid.x - pinchMidX;
          const dy = currentMid.y - pinchMidY;
          boardWrapper.scrollLeft = scrollLeft - dx;
          boardWrapper.scrollTop = scrollTop - dy;
          return;
        }

        if (isPanning && e.touches.length === 1) {
          const x = e.touches[0].pageX - boardWrapper.offsetLeft;
          const y = e.touches[0].pageY - boardWrapper.offsetTop;
          boardWrapper.scrollLeft = scrollLeft - (x - panStartX);
          boardWrapper.scrollTop = scrollTop - (y - panStartY);
          return;
        }

        if (!isDrawing || activeCanvas !== canvas || e.touches.length !== 1) return;
        if (e.cancelable) e.preventDefault();
        
        const pos = getPos(e.touches[0].clientX, e.touches[0].clientY);
        drawOnCanvas(pos.x, pos.y, ctx);
      }

      function handleTouchEnd(e) {
        if (isPinching) {
          isPinching = false;
          return;
        }
        if (isPanning) {
          isPanning = false;
          return;
        }
        if (isDrawing) {
          isDrawing = false;
          saveHistory(canvas);
        }
      }

      function handleMouseDown(e) {
        if (currentTool === 'hand') return;
        activeCanvas = canvas;
        const pos = getPos(e.clientX, e.clientY);
        startX = pos.x; startY = pos.y;
        lastX = pos.x; lastY = pos.y;

        if (currentTool === 'stamp') {
          ctx.font = `32px Arial, sans-serif`;
          ctx.fillText(currentStamp, pos.x - 16, pos.y + 16);
          saveHistory(canvas);
          return;
        }

        if (currentTool === 'text') {
          createInlineTextBox(wrapper, canvas, pos.x, pos.y);
          return;
        }

        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }

      function handleMouseMove(e) {
        if (!isDrawing || activeCanvas !== canvas) return;
        const pos = getPos(e.clientX, e.clientY);
        drawOnCanvas(pos.x, pos.y, ctx);
      }

      function handleMouseUp() {
        if (isDrawing) {
          isDrawing = false;
          saveHistory(canvas);
        }
      }

      function drawOnCanvas(x, y, ctx) {
        const color = document.getElementById('pen-color').value;

        if (currentTool === 'pen') {
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = color;
          ctx.lineWidth = brushThickness;
          ctx.lineCap = 'round';
          ctx.lineTo(x, y);
          ctx.stroke();
        } else if (currentTool === 'highlighter') {
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = color;
          ctx.lineWidth = brushThickness * 3.5;
          ctx.lineCap = 'square';
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        } else if (currentTool === 'brush') {
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = color;
          ctx.lineWidth = brushThickness * 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(x, y);
          ctx.stroke();
          lastX = x; lastY = y;
          ctx.globalAlpha = 1.0;
        } else if (currentTool === 'eraser') {
          ctx.clearRect(x - (brushThickness * 2), y - (brushThickness * 2), brushThickness * 4, brushThickness * 4);
        } else if (currentTool === 'shape') {
          ctx.putImageData(snapshot, 0, 0);
          ctx.strokeStyle = color;
          ctx.lineWidth = brushThickness;
          ctx.beginPath();
          const w = x - startX, h = y - startY;

          if (currentShape === 'rect') ctx.strokeRect(startX, startY, w, h);
          else if (currentShape === 'circle') { ctx.arc(startX, startY, Math.sqrt(w*w + h*h), 0, 2*Math.PI); ctx.stroke(); }
          else if (currentShape === 'line') { ctx.moveTo(startX, startY); ctx.lineTo(x, y); ctx.stroke(); }
          else if (currentShape === 'arrow') {
            ctx.moveTo(startX, startY); ctx.lineTo(pos.x, pos.y); ctx.stroke();
            let angle = Math.atan2(h, w);
            ctx.lineTo(pos.x - 12 * Math.cos(angle - Math.PI / 6), pos.y - 12 * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x - 12 * Math.cos(angle + Math.PI / 6), pos.y - 12 * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          }
        }
      }

      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);

      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        checkAndApplyDeviceLayout();
        document.querySelectorAll('.page-wrapper').forEach(w => setupPage(w, true));
      }, 100);
    });

    document.querySelectorAll('.page-wrapper').forEach(w => setupPage(w, false));
  </script>
</body>
</html>
