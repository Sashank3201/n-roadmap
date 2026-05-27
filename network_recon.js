document.addEventListener('DOMContentLoaded', () => {
  // Register Service Worker for offline PWA support
  registerServiceWorker();

  // Restructure monolithic DOM into a mobile-first Progressive Web App layout
  restructureDOM();
});

let daysData = [];
let phasesData = {
  1: { numStr: 'Phase 1', title: 'See the wire.', days: [], totalChecks: 0, checkedCount: 0 },
  2: { numStr: 'Phase 2', title: 'Map territory.', days: [], totalChecks: 0, checkedCount: 0 },
  3: { numStr: 'Phase 3', title: 'Touch the wire.', days: [], totalChecks: 0, checkedCount: 0 },
  4: { numStr: 'Phase 4', title: 'Go operational.', days: [], totalChecks: 0, checkedCount: 0 }
};
let checkedStates = {};
let activeTab = 'home'; // home, modules, reader, stats
let activeDayIndex = 0; // standard Day 01 index is 0

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then((reg) => console.log('[PWA] Service Worker registered successfully:', reg.scope))
        .catch((err) => console.error('[PWA] Service Worker registration failed:', err));
    });
  }
}

/**
 * RECONSTRUCT DOM TO PREMIUM MOBILE VIEWPORT GRID
 */
function restructureDOM() {
  const wrap = document.querySelector('.wrap');
  if (!wrap) return;

  const hero = wrap.querySelector('.hero');
  const howto = wrap.querySelector('.howto');
  const meta = wrap.querySelector('.meta');
  const endBlock = wrap.querySelector('.end');

  // Load user progress
  checkedStates = JSON.parse(localStorage.getItem('network_recon_progress')) || {};

  // Extract all day blocks and map to phases
  for (let pIndex = 1; pIndex <= 4; pIndex++) {
    const phaseContainer = wrap.querySelector(`.phase-${pIndex}`);
    if (phaseContainer) {
      const dayElements = phaseContainer.querySelectorAll('.day');
      dayElements.forEach((dayEl) => {
        const dayNumEl = dayEl.querySelector('.day-num');
        const dayTitleEl = dayEl.querySelector('h3');
        const dayNumText = dayNumEl ? dayNumEl.textContent.trim() : 'Day';
        
        let dayTitleText = '';
        if (dayTitleEl) {
          const clonedTitle = dayTitleEl.cloneNode(true);
          dayTitleText = clonedTitle.innerText.replace(/[\n\r]+/g, ' ').trim();
        }

        const checkSpans = dayEl.querySelectorAll('.check');
        const dayIndex = daysData.length;

        const dayObj = {
          element: dayEl,
          dayNum: dayNumText,
          title: dayTitleText,
          phase: pIndex,
          index: dayIndex,
          totalChecks: checkSpans.length,
          checkedCount: 0
        };

        dayEl.setAttribute('data-day-index', dayIndex);
        dayEl.setAttribute('data-phase-index', pIndex);

        daysData.push(dayObj);
        phasesData[pIndex].days.push(dayObj);
      });
    }
  }

  // 1. Build dynamic Top status safe-area bar
  const topBar = document.createElement('div');
  topBar.className = 'top-status-bar';
  document.body.appendChild(topBar);

  // 2. Build modern top progress indicator
  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.id = 'top-progress-bar';
  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);

  // 3. Create core PWA App Container
  const appContainer = document.createElement('div');
  appContainer.className = 'app-container';

  // --- STICKY TOP HEADER ---
  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="app-header-title" id="app-bar-title">Network <em>recon</em></div>
    <div class="app-header-stats" id="app-bar-stats">0%</div>
  `;
  appContainer.appendChild(header);

  // --- TAB VIEWS CONTROLLER ---
  const tabViewContainer = document.createElement('div');
  tabViewContainer.className = 'tab-view-container';

  // ** TAB 1: HOME VIEW **
  const tabHome = document.createElement('div');
  tabHome.className = 'tab-view active';
  tabHome.id = 'tab-home';
  
  const greetingCard = document.createElement('div');
  greetingCard.className = 'home-greeting-card';
  greetingCard.innerHTML = `
    <h3>Welcome, <em>Operator</em></h3>
    <p>Get ready to hit the wire. 30 days of isolated virtual labs, custom packet crafting, port mapping, and live sniffing.</p>
    <div class="resume-btn-row">
      <button class="btn-resume" id="btn-home-resume">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        <span>Resume Course</span>
      </button>
    </div>
  `;
  tabHome.appendChild(greetingCard);

  const tiles = document.createElement('div');
  tiles.className = 'dashboard-tiles';
  tiles.innerHTML = `
    <div class="stat-tile">
      <span class="stat-tile-lbl">Total Tasks</span>
      <span class="stat-tile-val" id="tile-checked-count">0</span>
      <span class="stat-tile-sub" id="tile-total-count">/ 80 tasks</span>
    </div>
    <div class="stat-tile">
      <span class="stat-tile-lbl">Modules</span>
      <span class="stat-tile-val" id="tile-modules-val">0/4</span>
      <span class="stat-tile-sub" style="color:var(--indigo-soft)">Phases complete</span>
    </div>
  `;
  tabHome.appendChild(tiles);

  const pwaHelp = document.createElement('div');
  pwaHelp.className = 'pwa-help-card';
  pwaHelp.innerHTML = `
    <div class="pwa-icon-glow">⚡</div>
    <div class="pwa-help-body">
      <h4>Run standalone on mobile</h4>
      <p>Tap your browser's share button and select <strong>"Add to Home Screen"</strong> to install as a full-screen, offline-capable native hacking app.</p>
    </div>
  `;
  tabHome.appendChild(pwaHelp);

  if (howto) tabHome.appendChild(howto);
  if (meta) tabHome.appendChild(meta);
  if (endBlock) tabHome.appendChild(endBlock);
  tabViewContainer.appendChild(tabHome);

  // ** TAB 2: CURRICULUM MODULES VIEW **
  const tabModules = document.createElement('div');
  tabModules.className = 'tab-view';
  tabModules.id = 'tab-modules';
  
  for (let pIndex = 1; pIndex <= 4; pIndex++) {
    const phaseGroup = document.createElement('div');
    phaseGroup.className = 'phase-group';

    const phaseCard = document.createElement('div');
    phaseCard.className = `phase-card phase-${pIndex}`;
    phaseCard.innerHTML = `
      <div class="phase-card-header" data-phase="${pIndex}">
        <div class="phase-meta">
          <span class="phase-tag">${phasesData[pIndex].numStr}</span>
          <span class="phase-progress-percent" id="phase-card-${pIndex}-percent">0%</span>
        </div>
        <h3>${phasesData[pIndex].title}</h3>
        <div class="phase-progress-mini">
          <div class="phase-progress-fill" id="phase-card-${pIndex}-fill"></div>
        </div>
      </div>
      <div class="phase-days-list" id="phase-days-list-${pIndex}"></div>
    `;

    // Click tab header to expand/collapse days list
    phaseCard.querySelector('.phase-card-header').addEventListener('click', () => {
      phaseCard.classList.toggle('expanded');
    });

    phaseGroup.appendChild(phaseCard);
    tabModules.appendChild(phaseGroup);
  }
  tabViewContainer.appendChild(tabModules);

  // ** TAB 3: Focused READER VIEW **
  const tabReader = document.createElement('div');
  tabReader.className = 'tab-view';
  tabReader.id = 'tab-reader';

  const readerWrap = document.createElement('div');
  readerWrap.className = 'reader-wrapper';
  readerWrap.innerHTML = `
    <div class="reader-header">
      <div class="reader-breadcrumb">
        <span class="active-phase-lbl" id="reader-phase-lbl">Phase 1</span>
        <span class="sep">/</span>
        <span id="reader-day-lbl" style="color:var(--ink);">Day 01</span>
      </div>
      <div class="reader-nav-buttons">
        <button class="reader-nav-btn" id="btn-reader-prev">← Prev</button>
        <button class="reader-nav-btn" id="btn-reader-next">Next →</button>
      </div>
    </div>
    <div class="day-content-viewport" id="reader-viewport"></div>
  `;
  tabReader.appendChild(readerWrap);
  tabViewContainer.appendChild(tabReader);

  // Populate reader content viewport
  const rViewport = readerWrap.querySelector('#reader-viewport');
  daysData.forEach((dayObj) => {
    rViewport.appendChild(dayObj.element);
  });

  // ** TAB 4: ADVANCED STATS VIEW **
  const tabStats = document.createElement('div');
  tabStats.className = 'tab-view';
  tabStats.id = 'tab-stats';

  const statsContainer = document.createElement('div');
  statsContainer.className = 'stats-container';
  statsContainer.innerHTML = `
    <div class="stats-header-card">
      <div class="stats-header-info">
        <span class="stats-header-title">Total Tasks Completed</span>
        <span class="stats-header-count" id="stats-progress-count">0 <span>/ 80 done</span></span>
      </div>
      <div class="stats-circle-container">
        <div class="stats-progress-circle" id="stats-progress-circle">0%</div>
      </div>
    </div>
    
    <div class="phase-tabs-title" style="margin-top:8px;">Breakdown By Phase</div>
    <div class="stats-phases-grid" id="stats-phases-grid"></div>
  `;

  const grid = statsContainer.querySelector('#stats-phases-grid');
  for (let pIndex = 1; pIndex <= 4; pIndex++) {
    const row = document.createElement('div');
    row.className = 'stats-phase-row';
    row.innerHTML = `
      <div class="stats-phase-row-top">
        <span class="stats-phase-title-text">${phasesData[pIndex].numStr}: <em>${phasesData[pIndex].title.split('.')[0]}</em></span>
        <span class="stats-phase-score" id="stats-phase-${pIndex}-score">0 / 0</span>
      </div>
      <div class="stats-phase-bar-track">
        <div class="stats-phase-bar-fill" id="stats-phase-${pIndex}-fill"></div>
      </div>
    `;
    grid.appendChild(row);
  }

  tabStats.appendChild(statsContainer);
  tabViewContainer.appendChild(tabStats);

  appContainer.appendChild(tabViewContainer);

  // --- STICKY BOTTOM APP TAB BAR ---
  const tabNav = document.createElement('nav');
  tabNav.className = 'app-tab-bar';
  tabNav.innerHTML = `
    <button class="tab-btn active" data-tab="home">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      <span>Home</span>
    </button>
    <button class="tab-btn" data-tab="modules">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      <span>Curriculum</span>
    </button>
    <button class="tab-btn" data-tab="reader">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      <span>Reader</span>
    </button>
    <button class="tab-btn" data-tab="stats">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      <span>Stats</span>
    </button>
  `;
  appContainer.appendChild(tabNav);

  // Replace wrapping container
  wrap.parentNode.replaceChild(appContainer, wrap);

  // Clean and prepare original checklist spans
  initChecklists();

  // Clean and prepare original copy spans
  initCopyButtons();

  // Setup click transitions and triggers
  bindEvents();

  // Load last active viewed day / tab
  loadSavedState();

  // Execute first progress calculation
  updateProgress();
}

/**
 * DOUBLE-CHECK TICK INJECTION ENGINE
 */
function initChecklists() {
  const checkSpans = document.querySelectorAll('.check');

  checkSpans.forEach((checkSpan, index) => {
    const parent = checkSpan.parentNode;
    const nextSibling = checkSpan.nextSibling;

    if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
      const textContent = nextSibling.nodeValue;
      const lineEndIndex = textContent.indexOf('\n');
      let lineText = textContent;
      let remainingText = '';

      if (lineEndIndex !== -1) {
        lineText = textContent.substring(0, lineEndIndex);
        remainingText = textContent.substring(lineEndIndex);
      }

      // Dynamic mobile wrap
      const wrapper = document.createElement('span');
      wrapper.className = 'interactive-check-row';
      wrapper.dataset.index = index;

      parent.insertBefore(wrapper, checkSpan);
      wrapper.appendChild(checkSpan);

      const textSpan = document.createElement('span');
      textSpan.className = 'check-text';
      textSpan.textContent = lineText.trim();
      wrapper.appendChild(textSpan);

      nextSibling.nodeValue = remainingText;

      // Click to check off items
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        const isChecked = wrapper.classList.toggle('checked');
        checkedStates[index] = isChecked;
        localStorage.setItem('network_recon_progress', JSON.stringify(checkedStates));

        if (isChecked) {
          checkSpan.textContent = '☑';
          checkSpan.style.transform = 'scale(1.25)';
          setTimeout(() => checkSpan.style.transform = 'scale(1)', 150);
        } else {
          checkSpan.textContent = '□';
        }

        updateProgress();
      });
    }
  });
}

/**
 * NATIVE BIND EVENTS AND ACTIONS
 */
function bindEvents() {
  // Bottom Tab Navigator Clicking
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabTarget = tab.dataset.tab;
      switchTab(tabTarget);
    });
  });

  // Prev / Next day button binds inside Reader
  const prevBtn = document.getElementById('btn-reader-prev');
  const nextBtn = document.getElementById('btn-reader-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (activeDayIndex > 0) {
        selectDay(activeDayIndex - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (activeDayIndex < daysData.length - 1) {
        selectDay(activeDayIndex + 1);
      }
    });
  }

  // Brand clicking jumps straight back Home
  const brandTitle = document.getElementById('app-bar-title');
  if (brandTitle) {
    brandTitle.addEventListener('click', () => {
      switchTab('home');
    });
  }

  // Home resume button bind
  const resumeBtn = document.getElementById('btn-home-resume');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      resumeLearning();
    });
  }
}

/**
 * TAB VIEW ROUTING
 */
function switchTab(tabId) {
  activeTab = tabId;
  localStorage.setItem('network_recon_active_tab', tabId);

  // Toggle tab buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle tab view visibility with smooth transitions
  document.querySelectorAll('.tab-view').forEach((view) => {
    if (view.id === `tab-${tabId}`) {
      // 1. Show the layout first
      view.style.display = 'block';
      // Smooth viewport top-scroll reset
      view.scrollTop = 0;
      
      // 2. Trigger repaint to allow transition to register
      view.offsetHeight;
      
      // 3. Trigger slide-up and fade-in animation
      view.classList.add('active');
    } else {
      // 1. Trigger slide-down and fade-out animation first
      view.classList.remove('active');
      
      // 2. Hide from layout once transition completes
      const handleTransitionEnd = () => {
        if (!view.classList.contains('active')) {
          view.style.display = 'none';
        }
        view.removeEventListener('transitionend', handleTransitionEnd);
      };
      view.addEventListener('transitionend', handleTransitionEnd);
      
      // Safety timeout in case transitionend does not fire
      setTimeout(() => {
        if (!view.classList.contains('active')) {
          view.style.display = 'none';
        }
      }, 300);
    }
  });

  // Dynamically update dynamic status title
  const titleEl = document.getElementById('app-bar-title');
  if (titleEl) {
    if (tabId === 'home') titleEl.innerHTML = 'Network <em>recon</em>';
    else if (tabId === 'modules') titleEl.textContent = 'Curriculum';
    else if (tabId === 'reader') titleEl.textContent = 'Day Reader';
    else if (tabId === 'stats') titleEl.textContent = 'Statistics';
  }
}

function selectDay(dayIndex) {
  activeDayIndex = dayIndex;
  localStorage.setItem('network_recon_active_day', dayIndex);

  const dayObj = daysData[dayIndex];
  if (!dayObj) return;

  // Toggle active day content visibility
  daysData.forEach((d) => {
    if (d.index === dayIndex) {
      d.element.classList.add('active');
    } else {
      d.element.classList.remove('active');
    }
  });

  // Update Breadcrumb metrics
  const breadPhase = document.getElementById('reader-phase-lbl');
  const breadDay = document.getElementById('reader-day-lbl');
  if (breadPhase) breadPhase.textContent = `Phase ${dayObj.phase}`;
  if (breadDay) breadDay.innerHTML = `${dayObj.dayNum} <em style="font-style:italic; font-weight:300; color:var(--ink-dim); font-size:11px; margin-left:4px;">— ${dayObj.title}</em>`;

  // Enable / Disable buttons
  const prevBtn = document.getElementById('btn-reader-prev');
  const nextBtn = document.getElementById('btn-reader-next');
  if (prevBtn) prevBtn.disabled = (dayIndex === 0);
  if (nextBtn) nextBtn.disabled = (dayIndex === daysData.length - 1);

  // Auto-switch to active Reader tab
  switchTab('reader');
}

function resumeLearning() {
  const savedDay = localStorage.getItem('network_recon_active_day');
  if (savedDay !== null) {
    selectDay(parseInt(savedDay));
  } else {
    // Navigate to the first uncompleted day
    let resumeIndex = 0;
    for (let i = 0; i < daysData.length; i++) {
      if (!isDayFullyCompleted(daysData[i])) {
        resumeIndex = i;
        break;
      }
    }
    selectDay(resumeIndex);
  }
}

/**
 * CHECKLIST HELPER METHOD
 */
function isDayFullyCompleted(dayObj) {
  const checkSpans = dayObj.element.querySelectorAll('.interactive-check-row');
  if (checkSpans.length === 0) return false;

  let allChecked = true;
  checkSpans.forEach((span) => {
    const idx = span.dataset.index;
    if (!checkedStates[idx]) {
      allChecked = false;
    }
  });
  return allChecked;
}

/**
 * PARSE AND BUILD DYNAMIC MODULE DAYS IN CURRICULUM MODULES SCREEN
 */
function buildCurriculumDaysList() {
  for (let pIndex = 1; pIndex <= 4; pIndex++) {
    const listEl = document.getElementById(`phase-days-list-${pIndex}`);
    if (!listEl) continue;

    listEl.innerHTML = '';

    phasesData[pIndex].days.forEach((dayObj) => {
      const isCompleted = isDayFullyCompleted(dayObj);

      const row = document.createElement('div');
      row.className = 'phase-day-row';
      row.innerHTML = `
        <div class="phase-day-info">
          <span class="day-pill">D${dayObj.dayNum.replace(/\D/g,'')}</span>
          <span class="day-title-text">${dayObj.title.split('&amp;')[0].split('—')[0].substring(0, 20)}...</span>
        </div>
        <div class="day-check-indicator ${isCompleted ? 'completed' : ''}"></div>
      `;

      // Tap day to open Reader Tab at that Day index
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        selectDay(dayObj.index);
      });

      listEl.appendChild(row);
    });
  }
}

function loadSavedState() {
  const savedTab = localStorage.getItem('network_recon_active_tab');
  const savedDay = localStorage.getItem('network_recon_active_day');

  if (savedDay !== null) {
    selectDay(parseInt(savedDay));
  } else {
    selectDay(0); // default to Day 01
  }

  if (savedTab !== null) {
    switchTab(savedTab);
  } else {
    switchTab('home');
  }
}

/**
 * RECALCULATE PROGRESS AND RE-RENDER LABELS
 */
function updateProgress() {
  const total = document.querySelectorAll('.interactive-check-row').length;
  let overallChecked = 0;

  // Reset Phase Counters
  for (let pIndex = 1; pIndex <= 4; pIndex++) {
    phasesData[pIndex].totalChecks = 0;
    phasesData[pIndex].checkedCount = 0;
  }

  // Tally totals
  const checkRows = document.querySelectorAll('.interactive-check-row');
  checkRows.forEach((row) => {
    const index = parseInt(row.dataset.index);
    const dayEl = row.closest('.day');
    const phaseIndex = dayEl ? parseInt(dayEl.getAttribute('data-phase-index')) : null;

    const isChecked = checkedStates[index] || false;
    if (isChecked) {
      overallChecked++;
      const checkMark = row.querySelector('.check');
      if (checkMark) checkMark.textContent = '☑';
      row.classList.add('checked');
    } else {
      const checkMark = row.querySelector('.check');
      if (checkMark) checkMark.textContent = '□';
      row.classList.remove('checked');
    }

    if (phaseIndex && phasesData[phaseIndex]) {
      phasesData[phaseIndex].totalChecks++;
      if (isChecked) {
        phasesData[phaseIndex].checkedCount++;
      }
    }
  });

  const percent = total > 0 ? Math.round((overallChecked / total) * 100) : 0;

  // Calculate phase counts completed
  let completedPhases = 0;
  for (let pIndex = 1; pIndex <= 4; pIndex++) {
    const phaseObj = phasesData[pIndex];
    if (phaseObj.totalChecks > 0 && phaseObj.checkedCount === phaseObj.totalChecks) {
      completedPhases++;
    }
  }

  // 1. Update status-bar progress top line
  const topBar = document.getElementById('top-progress-bar');
  if (topBar) topBar.style.width = `${percent}%`;

  // 2. Update Header stats pill
  const headerStats = document.getElementById('app-bar-stats');
  if (headerStats) headerStats.textContent = `${percent}%`;

  // 3. Update Home Dashboard tiles
  const tileChecked = document.getElementById('tile-checked-count');
  const tileTotal = document.getElementById('tile-total-count');
  const tileModules = document.getElementById('tile-modules-val');

  if (tileChecked) tileChecked.textContent = overallChecked;
  if (tileTotal) tileTotal.textContent = `/ ${total} checks`;
  if (tileModules) tileModules.textContent = `${completedPhases}/4`;

  // 4. Update Phase Card progress mini-bars (Curriculum Tab)
  for (let pIndex = 1; pIndex <= 4; pIndex++) {
    const phaseObj = phasesData[pIndex];
    const pPercent = phaseObj.totalChecks > 0 ? Math.round((phaseObj.checkedCount / phaseObj.totalChecks) * 100) : 0;

    const fill = document.getElementById(`phase-card-${pIndex}-fill`);
    const txtPercent = document.getElementById(`phase-card-${pIndex}-percent`);

    if (fill) fill.style.width = `${pPercent}%`;
    if (txtPercent) txtPercent.textContent = `${pPercent}%`;
  }

  // 5. Update Advanced stats cards (Stats Tab)
  const statsCount = document.getElementById('stats-progress-count');
  const statsCircle = document.getElementById('stats-progress-circle');

  if (statsCount) statsCount.innerHTML = `${overallChecked} <span>/ ${total} done</span>`;
  if (statsCircle) {
    statsCircle.textContent = `${percent}%`;
    statsCircle.style.background = `radial-gradient(circle, var(--surface) 55%, transparent 56%), conic-gradient(var(--indigo) 0deg, var(--aqua) ${percent * 3.6}deg, rgba(255,255,255,0.04) 0deg)`;
  }

  for (let pIndex = 1; pIndex <= 4; pIndex++) {
    const phaseObj = phasesData[pIndex];
    const pPercent = phaseObj.totalChecks > 0 ? Math.round((phaseObj.checkedCount / phaseObj.totalChecks) * 100) : 0;

    const rowScore = document.getElementById(`stats-phase-${pIndex}-score`);
    const rowFill = document.getElementById(`stats-phase-${pIndex}-fill`);

    if (rowScore) rowScore.textContent = `${phaseObj.checkedCount} / ${phaseObj.totalChecks} (${pPercent}%)`;
    if (rowFill) rowFill.style.width = `${pPercent}%`;
  }

  // 6. Rebuild curriculum tab days to sync completion checks
  buildCurriculumDaysList();
}

/**
 * 2. CODE BLOCK COPY TO CLIPBOARD BUTTONS
 */
function initCopyButtons() {
  const codeBlocks = document.querySelectorAll('.code');

  codeBlocks.forEach((codeBlock) => {
    const codeBar = codeBlock.querySelector('.code-bar');
    const pre = codeBlock.querySelector('pre');

    if (codeBar && pre) {
      let codeBarLeft = codeBar.querySelector('.code-bar-left');
      
      if (!codeBarLeft) {
        const originalHTML = codeBar.innerHTML;
        codeBar.innerHTML = '';

        codeBarLeft = document.createElement('div');
        codeBarLeft.className = 'code-bar-left';
        codeBarLeft.innerHTML = originalHTML;
        codeBar.appendChild(codeBarLeft);
      }

      if (!codeBar.querySelector('.copy-btn')) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span>Copy</span>
        `;

        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          let codeText = pre.innerText || pre.textContent;

          navigator.clipboard.writeText(codeText.trim()).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.querySelector('span').textContent = 'Copied!';
            
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.querySelector('span').textContent = 'Copy';
            }, 1500);
          }).catch(err => {
            console.error('Failed to copy: ', err);
          });
        });

        codeBar.appendChild(copyBtn);
      }
    }
  });
}
