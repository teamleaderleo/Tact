(() => {
  'use strict';

  const STORAGE_KEY = 'tactWarmField.v1';
  const warmIds = ['browser-api', 'terminal-build', 'code-auth', 'notes-ideas'];
  const trialPattern = ['warm', 'recent', 'cold', 'warm', 'recent', 'warm', 'cold', 'warm'];

  const tasks = [
    task('browser-api', 'API docs + repro', 'Browser', 'B', '#547ca8', '#18222c', 'changed', 'left', .18),
    task('mail-vendor', 'Vendor reply', 'Mail', 'M', '#8b6f9f', '#241e2a', 'steady', 'left', .41),
    task('calendar-launch', 'Launch calendar', 'Calendar', 'C', '#9b7554', '#2a221d', 'done', 'left', .68),
    task('terminal-build', 'Build + tests', 'Terminal', 'T', '#5e8b68', '#18251c', 'blocked', 'right', .17),
    task('code-auth', 'Auth refactor', 'Code', '⌘', '#5d78a2', '#18202b', 'changed', 'right', .42),
    task('issue-crash', 'Crash issue #184', 'Issue', '#', '#a55d5d', '#2b1b1b', 'blocked', 'right', .69),
    task('notes-ideas', 'Interface notes', 'Notes', 'N', '#9a8754', '#29251a', 'steady', 'top', .22),
    task('sheet-cost', 'Cost model', 'Sheet', 'S', '#5b8877', '#182520', 'changed', 'top', .52),
    task('chat-review', 'Review thread', 'Chat', '@', '#8c6f9a', '#261f2a', 'steady', 'top', .80),
    task('dashboard-agents', 'Agent dashboard', 'Dashboard', 'D', '#6e8298', '#1d2329', 'done', 'bottom', .22),
    task('image-layout', 'Layout references', 'Images', '▧', '#9a6d5d', '#291e1a', 'changed', 'bottom', .52),
    task('logs-prod', 'Prod logs', 'Logs', 'L', '#5f8d8c', '#192525', 'steady', 'bottom', .80),
    task('docs-brief', 'Product brief', 'Docs', 'P', '#826c9d', '#221d29', 'steady', 'left', .86),
    task('query-users', 'User queries', 'Data', 'Q', '#7b8957', '#24271b', 'changed', 'right', .86),
    task('deploy-check', 'Deploy checklist', 'Ops', '✓', '#887957', '#27231a', 'done', 'bottom', .38),
    task('research-tabs', 'Tab research', 'Research', 'R', '#6d789a', '#1d2029', 'steady', 'top', .66),
  ];

  function task(id, name, app, glyph, accent, bg, state, edge, pos) {
    return { id, name, app, glyph, accent, bg, state, edge, pos };
  }

  const els = {
    stage: document.querySelector('#stage'),
    bookmarkLayer: document.querySelector('#bookmarkLayer'),
    focusWindow: document.querySelector('#focusWindow'),
    mruRail: document.querySelector('#mruRail'),
    searchOverlay: document.querySelector('#searchOverlay'),
    searchInput: document.querySelector('#searchInput'),
    searchResults: document.querySelector('#searchResults'),
    modeControl: document.querySelector('#modeControl'),
    screenControl: document.querySelector('#screenControl'),
    taskCount: document.querySelector('#taskCount'),
    taskCountLabel: document.querySelector('#taskCountLabel'),
    trainingLabels: document.querySelector('#trainingLabels'),
    startTrial: document.querySelector('#startTrial'),
    collapseFocus: document.querySelector('#collapseFocus'),
    trialKicker: document.querySelector('#trialKicker'),
    trialPrompt: document.querySelector('#trialPrompt'),
    trialMode: document.querySelector('#trialMode'),
    trialClass: document.querySelector('#trialClass'),
    trialTimer: document.querySelector('#trialTimer'),
    stageNote: document.querySelector('#stageNote'),
    metricTrials: document.querySelector('#metricTrials'),
    metricMedian: document.querySelector('#metricMedian'),
    metricErrors: document.querySelector('#metricErrors'),
    metricEvents: document.querySelector('#metricEvents'),
    eventFeed: document.querySelector('#eventFeed'),
    exportJson: document.querySelector('#exportJson'),
    exportCsv: document.querySelector('#exportCsv'),
    clearData: document.querySelector('#clearData'),
  };

  const state = loadState();
  let timerRaf = null;

  function freshState() {
    return {
      sessionId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      mode: 'cropped',
      screen: 'wide',
      taskCount: 12,
      trainingLabels: true,
      focusId: null,
      accessHistory: [],
      trialIndex: 0,
      activeTrial: null,
      events: [],
      trials: [],
      lastPointer: null,
    };
  }

  function loadState() {
    const base = freshState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      return { ...base, ...saved, activeTrial: null };
    } catch {
      return base;
    }
  }

  function persist() {
    const serializable = { ...state, activeTrial: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }

  function visibleTasks() { return tasks.slice(0, state.taskCount); }
  function getTask(id) { return tasks.find(t => t.id === id); }

  function render() {
    els.stage.className = `stage ${state.screen} mode-${state.mode}`;
    document.body.classList.toggle('show-training-labels', state.trainingLabels);
    els.taskCount.value = String(state.taskCount);
    els.taskCountLabel.textContent = `${state.taskCount} visible`;
    els.trainingLabels.checked = state.trainingLabels;
    els.trialMode.textContent = state.mode;
    els.stageNote.textContent = state.screen === 'wide'
      ? '27-inch simulation · stable normalized edge slots'
      : 'Laptop simulation · same task identities mapped to the same edges';

    [...els.modeControl.querySelectorAll('button')].forEach(b => b.classList.toggle('selected', b.dataset.mode === state.mode));
    [...els.screenControl.querySelectorAll('button')].forEach(b => b.classList.toggle('selected', b.dataset.screen === state.screen));

    renderBookmarks();
    renderFocus();
    renderMRU();
    renderSearch();
    renderMetrics();
    renderTrialText();
    persist();
  }

  function renderBookmarks() {
    els.bookmarkLayer.innerHTML = '';
    if (!['cropped', 'scaled'].includes(state.mode)) return;

    visibleTasks().forEach(t => {
      const b = document.createElement('button');
      b.className = `bookmark mode-${state.mode} edge-${t.edge}${state.focusId === t.id ? ' selected' : ''}`;
      b.type = 'button';
      b.dataset.taskId = t.id;
      b.setAttribute('aria-label', `${t.name}, ${t.state}, ${t.edge} edge bookmark`);
      if (t.edge === 'left' || t.edge === 'right') b.style.top = `${t.pos * 100}%`;
      else b.style.left = `${t.pos * 100}%`;
      b.innerHTML = `
        <span class="bookmark-hit" aria-hidden="true"></span>
        <span class="bookmark-visual" aria-hidden="true">${fakeWindowHTML(t, true)}</span>
        <span class="status-dot ${t.state}" aria-hidden="true"></span>
        <span class="bookmark-label">${escapeHTML(t.name)} · ${t.state}</span>
      `;
      b.addEventListener('pointerdown', rememberPointer);
      b.addEventListener('click', () => chooseTask(t.id, state.mode));
      els.bookmarkLayer.appendChild(b);
    });
  }

  function renderFocus() {
    const t = getTask(state.focusId);
    if (!t) {
      els.focusWindow.innerHTML = `
        <div class="focus-empty">
          <div class="focus-mark">⌘</div>
          <h2>Focus region</h2>
          <p>Select a task. Edge geography stays in place while the center expands.</p>
        </div>`;
      return;
    }
    els.focusWindow.innerHTML = fakeWindowHTML(t, false);
  }

  function fakeWindowHTML(t, compact) {
    return `
      <div class="fake-window${compact ? ' crop-window' : ''}" style="--task-accent:${t.accent};--task-bg:${t.bg}">
        <div class="window-chrome">
          <span class="window-dots"><i></i><i></i><i></i></span>
          <span class="window-title">${escapeHTML(t.name)}</span>
          <span class="window-state state-${t.state}">${t.state}</span>
        </div>
        <div class="window-body">
          <div class="window-rail">
            <span class="rail-chip active"></span><span class="rail-chip"></span><span class="rail-chip"></span><span class="rail-chip"></span><span class="rail-chip"></span>
          </div>
          <div class="window-content">
            <div class="content-heading"></div>
            <div class="content-line"></div><div class="content-line mid"></div><div class="content-line"></div><div class="content-line short"></div>
            <div class="content-card-row"><div class="content-card"></div><div class="content-card"></div><div class="content-card"></div></div>
            <div class="task-watermark">${escapeHTML(t.glyph)}</div>
          </div>
        </div>
      </div>`;
  }

  function renderMRU() {
    els.mruRail.innerHTML = '';
    if (state.mode !== 'mru') return;
    const ordered = mruOrder();
    ordered.forEach((t, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mru-item';
      b.style.setProperty('--task-accent', t.accent);
      b.innerHTML = `
        <span class="mru-cue">${escapeHTML(t.glyph)}</span>
        <span class="mru-copy"><strong>${escapeHTML(t.name)}</strong><span>${t.app} · ${t.state}</span></span>
        <span class="mru-rank">${i + 1}</span>`;
      b.addEventListener('pointerdown', rememberPointer);
      b.addEventListener('click', () => chooseTask(t.id, 'mru'));
      els.mruRail.appendChild(b);
    });
  }

  function mruOrder() {
    const list = visibleTasks();
    const lastIndex = new Map();
    state.accessHistory.forEach((id, i) => lastIndex.set(id, i));
    return list.slice().sort((a, b) => (lastIndex.get(b.id) ?? -1) - (lastIndex.get(a.id) ?? -1));
  }

  function renderSearch() {
    const q = els.searchInput.value.trim().toLowerCase();
    const results = visibleTasks()
      .filter(t => !q || `${t.name} ${t.app} ${t.state}`.toLowerCase().includes(q))
      .slice(0, 8);
    els.searchResults.innerHTML = '';
    results.forEach((t, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `search-result${i === 0 ? ' active' : ''}`;
      b.style.setProperty('--task-accent', t.accent);
      b.dataset.taskId = t.id;
      b.innerHTML = `<span class="cue">${escapeHTML(t.glyph)}</span><span><strong>${escapeHTML(t.name)}</strong><br><small>${t.app} · ${t.state}</small></span><small>${i + 1}</small>`;
      b.addEventListener('pointerdown', rememberPointer);
      b.addEventListener('click', () => chooseTask(t.id, 'search'));
      els.searchResults.appendChild(b);
    });
  }

  function chooseTask(id, via) {
    const t = getTask(id);
    if (!t || !visibleTasks().some(v => v.id === id)) return;
    const now = performance.now();
    const trial = state.activeTrial;
    const pointer = state.lastPointer;

    if (trial) {
      const correct = trial.targetId === id;
      const latencyMs = Math.round(now - trial.startedPerf);
      const movePx = pointer && trial.startPointer
        ? Math.round(Math.hypot(pointer.x - trial.startPointer.x, pointer.y - trial.startPointer.y))
        : null;
      logEvent('selection', { taskId: id, via, correct, latencyMs, targetClass: trial.targetClass, pointerDistancePx: movePx });
      if (!correct) {
        trial.errors += 1;
        els.trialKicker.textContent = 'Wrong target · keep going';
        els.trialTimer.textContent = `${latencyMs} ms`;
        renderMetrics();
        return;
      }

      const result = {
        sessionId: state.sessionId,
        trialIndex: trial.index,
        timestamp: new Date().toISOString(),
        mode: state.mode,
        screen: state.screen,
        taskCount: state.taskCount,
        trainingLabels: state.trainingLabels,
        targetClass: trial.targetClass,
        targetId: trial.targetId,
        targetName: t.name,
        targetEdge: t.edge,
        targetPosition: t.pos,
        latencyMs,
        errors: trial.errors,
        pointerDistancePx: movePx,
        accessDepthBefore: state.accessHistory.length,
      };
      state.trials.push(result);
      state.activeTrial = null;
      els.trialKicker.textContent = 'Correct';
      els.trialTimer.textContent = `${latencyMs} ms`;
    } else {
      logEvent('free-focus', { taskId: id, via });
    }

    state.focusId = id;
    state.accessHistory.push(id);
    if (state.accessHistory.length > 120) state.accessHistory.splice(0, state.accessHistory.length - 120);
    if (via === 'search') {
      els.searchInput.value = '';
      els.searchOverlay.classList.remove('open');
    }
    render();
  }

  function startTrial() {
    if (state.activeTrial) return;
    const cls = trialPattern[state.trialIndex % trialPattern.length];
    const target = chooseTarget(cls);
    if (!target) return;
    state.trialIndex += 1;
    state.activeTrial = {
      index: state.trialIndex,
      targetClass: cls,
      targetId: target.id,
      startedAt: new Date().toISOString(),
      startedPerf: performance.now(),
      errors: 0,
      startPointer: state.lastPointer ? { ...state.lastPointer } : null,
    };
    logEvent('trial-start', { trialIndex: state.trialIndex, targetClass: cls, targetId: target.id, mode: state.mode, screen: state.screen, taskCount: state.taskCount });
    if (state.mode === 'search') openSearch();
    renderTrialText();
    startTimer();
  }

  function chooseTarget(cls) {
    const visible = visibleTasks();
    const current = state.focusId;

    if (cls === 'warm') {
      const pool = visible.filter(t => warmIds.includes(t.id) && t.id !== current);
      return pool[state.trialIndex % Math.max(pool.length, 1)] || visible.find(t => t.id !== current) || visible[0];
    }

    if (cls === 'recent') {
      const recent = [...state.accessHistory].reverse().filter((id, i, arr) => arr.indexOf(id) === i && id !== current);
      const id = recent.find(r => visible.some(t => t.id === r));
      return getTask(id) || visible.find(t => t.id !== current) || visible[0];
    }

    const lastIndex = new Map();
    state.accessHistory.forEach((id, i) => lastIndex.set(id, i));
    const cold = visible
      .filter(t => t.id !== current)
      .slice()
      .sort((a, b) => (lastIndex.get(a.id) ?? -9999) - (lastIndex.get(b.id) ?? -9999));
    return cold[0] || visible[0];
  }

  function renderTrialText() {
    const trial = state.activeTrial;
    if (!trial) {
      if (!els.trialKicker.textContent.startsWith('Correct') && !els.trialKicker.textContent.startsWith('Wrong')) {
        els.trialKicker.textContent = 'Practice freely';
      }
      els.trialPrompt.textContent = 'Start a trial to measure target acquisition.';
      els.trialClass.textContent = '—';
      return;
    }
    const t = getTask(trial.targetId);
    els.trialKicker.textContent = `Trial ${trial.index} · ${trial.targetClass}`;
    els.trialPrompt.textContent = `Switch to “${t.name}”`;
    els.trialClass.textContent = trial.targetClass;
  }

  function startTimer() {
    cancelAnimationFrame(timerRaf);
    const tick = () => {
      if (!state.activeTrial) return;
      els.trialTimer.textContent = `${Math.round(performance.now() - state.activeTrial.startedPerf)} ms`;
      timerRaf = requestAnimationFrame(tick);
    };
    timerRaf = requestAnimationFrame(tick);
  }

  function collapseFocus(reason = 'button') {
    if (!state.focusId) return;
    logEvent('collapse-focus', { taskId: state.focusId, reason });
    state.focusId = null;
    render();
  }

  function setMode(mode) {
    if (state.mode === mode) return;
    const prior = state.mode;
    state.mode = mode;
    state.activeTrial = null;
    logEvent('mode-change', { from: prior, to: mode });
    if (mode === 'search') openSearch(); else els.searchOverlay.classList.remove('open');
    render();
  }

  function setScreen(screen) {
    if (state.screen === screen) return;
    const prior = state.screen;
    state.screen = screen;
    state.activeTrial = null;
    logEvent('screen-change', { from: prior, to: screen, focusId: state.focusId, taskCount: state.taskCount });
    render();
  }

  function openSearch() {
    els.searchOverlay.classList.add('open');
    requestAnimationFrame(() => els.searchInput.focus());
    logEvent('search-open', { query: els.searchInput.value });
  }

  function rememberPointer(e) { state.lastPointer = { x: e.clientX, y: e.clientY }; }

  function logEvent(type, details = {}) {
    state.events.push({
      sessionId: state.sessionId,
      timestamp: new Date().toISOString(),
      type,
      mode: state.mode,
      screen: state.screen,
      taskCount: state.taskCount,
      focusId: state.focusId,
      ...details,
    });
    if (state.events.length > 800) state.events.splice(0, state.events.length - 800);
    persist();
  }

  function renderMetrics() {
    const correct = state.trials;
    const times = correct.map(t => t.latencyMs).sort((a, b) => a - b);
    const errors = correct.reduce((sum, t) => sum + t.errors, 0) + (state.activeTrial?.errors || 0);
    els.metricTrials.textContent = String(correct.length);
    els.metricMedian.textContent = times.length ? `${median(times)} ms` : '—';
    els.metricErrors.textContent = String(errors);
    els.metricEvents.textContent = String(state.events.length);

    const latest = state.events.slice(-8).reverse();
    els.eventFeed.innerHTML = latest.map(e => {
      const d = new Date(e.timestamp);
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const detail = eventSummary(e);
      return `<li><time>${time}</time><span>${escapeHTML(detail)}</span></li>`;
    }).join('');
  }

  function eventSummary(e) {
    if (e.type === 'selection') return `${e.correct ? '✓' : '×'} ${getTask(e.taskId)?.name || e.taskId} · ${e.latencyMs}ms · ${e.via}`;
    if (e.type === 'trial-start') return `target ${getTask(e.targetId)?.name || e.targetId} · ${e.targetClass}`;
    if (e.type === 'screen-change') return `${e.from} → ${e.to}`;
    if (e.type === 'mode-change') return `${e.from} → ${e.to}`;
    if (e.type === 'collapse-focus') return `collapse ${getTask(e.taskId)?.name || e.taskId}`;
    if (e.type === 'search-open') return 'search opened';
    return e.type;
  }

  function median(sorted) {
    const m = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[m] : Math.round((sorted[m - 1] + sorted[m]) / 2);
  }

  function exportJSON() {
    download(`tact-warm-field-${Date.now()}.json`, JSON.stringify({
      exportedAt: new Date().toISOString(),
      sessionId: state.sessionId,
      tasks: visibleTasks().map(({ id, name, app, state: taskState, edge, pos }) => ({ id, name, app, state: taskState, edge, pos })),
      trials: state.trials,
      events: state.events,
    }, null, 2), 'application/json');
  }

  function exportCSV() {
    const fields = ['sessionId','trialIndex','timestamp','mode','screen','taskCount','trainingLabels','targetClass','targetId','targetName','targetEdge','targetPosition','latencyMs','errors','pointerDistancePx','accessDepthBefore'];
    const rows = [fields.join(',')].concat(state.trials.map(r => fields.map(f => csvCell(r[f])).join(',')));
    download(`tact-warm-field-${Date.now()}.csv`, rows.join('\n'), 'text/csv');
  }

  function csvCell(v) {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[c]));
  }

  els.modeControl.addEventListener('click', e => {
    const b = e.target.closest('[data-mode]');
    if (b) setMode(b.dataset.mode);
  });
  els.screenControl.addEventListener('click', e => {
    const b = e.target.closest('[data-screen]');
    if (b) setScreen(b.dataset.screen);
  });
  els.taskCount.addEventListener('input', e => {
    state.taskCount = Number(e.target.value);
    state.activeTrial = null;
    if (state.focusId && !visibleTasks().some(t => t.id === state.focusId)) state.focusId = null;
    logEvent('task-count-change', { count: state.taskCount });
    render();
  });
  els.trainingLabels.addEventListener('change', e => {
    state.trainingLabels = e.target.checked;
    logEvent('training-labels', { visible: state.trainingLabels });
    render();
  });
  els.startTrial.addEventListener('click', startTrial);
  els.collapseFocus.addEventListener('click', () => collapseFocus('button'));
  els.searchInput.addEventListener('input', () => { logEvent('search-query', { length: els.searchInput.value.length }); renderSearch(); });
  els.searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = els.searchResults.querySelector('.search-result');
      if (first) { e.preventDefault(); chooseTask(first.dataset.taskId, 'search'); }
    }
    if (e.key === 'Escape') { e.preventDefault(); els.searchOverlay.classList.remove('open'); els.searchInput.blur(); }
  });
  els.exportJson.addEventListener('click', exportJSON);
  els.exportCsv.addEventListener('click', exportCSV);
  els.clearData.addEventListener('click', () => {
    const keep = { mode: state.mode, screen: state.screen, taskCount: state.taskCount, trainingLabels: state.trainingLabels };
    Object.assign(state, freshState(), keep);
    localStorage.removeItem(STORAGE_KEY);
    render();
  });
  document.addEventListener('pointermove', e => { state.lastPointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement) return;
    if (['1','2','3','4'].includes(e.key)) setMode(['cropped','scaled','mru','search'][Number(e.key) - 1]);
    if (e.key.toLowerCase() === 'n') startTrial();
    if (e.key === '/') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') collapseFocus('keyboard');
  });

  render();
})();
