'use strict';

  function completeRun() {
    if (state.runCompleted) return;
    state.runCompleted = true;
    const elapsedMs = state.runStartedAt ? performance.now() - state.runStartedAt : 0;
    const result = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      scenario: state.scenarioId,
      scenarioLabel: currentScenario().label,
      mode: state.mode,
      modeLabel: MODE_LABELS[state.mode],
      injectedErrors: [...state.failuresUsed],
      elapsedMs: Math.round(elapsedMs),
      ...state.metrics,
    };
    state.results.unshift(result);
    saveResults();
    updateRunBadge();
    renderResults();
    renderMetrics();
    els.speechStatus.textContent = 'Correct outcome. Run saved.';
  }

  function renderResults() {
    if (!state.results.length) {
      els.resultsBody.innerHTML = '<tr><td colspan="11" class="empty-row">No completed runs yet.</td></tr>';
      els.comparisonSummary.innerHTML = 'Complete the same task in all three conditions to see a direct comparison.';
      return;
    }

    els.resultsBody.innerHTML = state.results.map((result) => `
      <tr>
        <td>${escapeHtml(result.scenarioLabel)}</td>
        <td>${escapeHtml(result.modeLabel)}</td>
        <td>${result.injectedErrors.length ? result.injectedErrors.map((id) => escapeHtml(FAILURE_LABELS[id])).join(', ') : 'Clean'}</td>
        <td class="mono">${(result.elapsedMs / 1000).toFixed(1)} s</td>
        <td class="mono">${result.actions}</td>
        <td class="mono">${result.voiceTurns}</td>
        <td class="mono">${result.spokenWords}</td>
        <td class="mono">${result.referentWords}</td>
        <td class="mono">${result.typedChars}</td>
        <td class="mono">${result.repairTurns}</td>
        <td class="mono">${result.wrongInterpretations}</td>
      </tr>`).join('');

    renderComparisonSummary();
  }

  function renderComparisonSummary() {
    const clean = state.results.filter((result) => result.scenario === state.scenarioId && result.injectedErrors.length === 0);
    const latestByMode = {};
    for (const result of clean) {
      if (!latestByMode[result.mode]) latestByMode[result.mode] = result;
    }

    if (!latestByMode.pointer || !latestByMode.voice || !latestByMode.mixed) {
      els.comparisonSummary.innerHTML = `For <strong>${escapeHtml(currentScenario().label)}</strong>, complete one clean run in each condition. Then compare the same injected failure in voice-only and mixed.`;
      return;
    }

    const pointer = latestByMode.pointer;
    const voice = latestByMode.voice;
    const mixed = latestByMode.mixed;
    const actionDelta = pointer.actions - mixed.actions;
    const referentDelta = voice.referentWords - mixed.referentWords;
    const timeDelta = pointer.elapsedMs - mixed.elapsedMs;

    els.comparisonSummary.innerHTML = `
      <strong>${escapeHtml(currentScenario().label)} clean run:</strong>
      mixed used ${formatDelta(actionDelta, 'fewer', 'more')} task actions than pointer + keyboard,
      ${referentDelta === 0 ? 'the same number of' : `${Math.abs(referentDelta)} ${referentDelta > 0 ? 'fewer' : 'more'}`} spoken referent words than voice-only,
      and finished ${formatTimeDelta(timeDelta)} pointer + keyboard.
      The repair rows below are the more important test: compare repair turns and repeated words under the same injected error.`;
  }

  function formatDelta(value, positiveWord, negativeWord) {
    if (value === 0) return 'the same number of';
    return `${Math.abs(value)} ${value > 0 ? positiveWord : negativeWord}`;
  }

  function formatTimeDelta(ms) {
    if (Math.abs(ms) < 100) return 'about even with';
    return `${(Math.abs(ms) / 1000).toFixed(1)} s ${ms > 0 ? 'ahead of' : 'behind'}`;
  }

  function loadResults() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveResults() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.results));
  }

  function clearResults() {
    state.results = [];
    saveResults();
    renderResults();
  }

  function exportResults() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), results: state.results }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `tact-clutch-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function prettyAction(action) {
    return action.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function isEditableTarget(target) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable;
  }

  document.querySelectorAll('input[name="mode"]').forEach((input) => {
    input.addEventListener('change', () => { if (input.checked) setMode(input.value); });
  });

  document.querySelectorAll('input[name="scenario"]').forEach((input) => {
    input.addEventListener('change', () => { if (input.checked) setScenario(input.value); });
  });

  els.micButton.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    startListening();
  });
  els.micButton.addEventListener('pointerup', (event) => {
    event.preventDefault();
    stopListening();
  });
  els.micButton.addEventListener('pointercancel', stopListening);
  els.micButton.addEventListener('pointerleave', () => { if (isListening) stopListening(); });

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !event.repeat && !isEditableTarget(event.target) && state.mode !== 'pointer') {
      event.preventDefault();
      startListening();
    }
    if (event.key === 'Escape' && state.repairSlot) {
      state.repairSlot = null;
      els.speechStatus.textContent = 'Pick repair cancelled.';
      renderInterpretation();
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && !isEditableTarget(event.target) && state.mode !== 'pointer') {
      event.preventDefault();
      stopListening();
    }
  });

  els.simulateBtn.addEventListener('click', () => {
    const value = els.simulatedUtterance.value.trim();
    if (!value) return;
    commitVoiceTurn(value);
    els.simulatedUtterance.value = '';
  });

  els.simulatedUtterance.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') els.simulateBtn.click();
  });

  els.resetRunBtn.addEventListener('click', () => resetRun());
  els.clearResultsBtn.addEventListener('click', clearResults);
  els.exportBtn.addEventListener('click', exportResults);

  state.results = loadResults();
  setupSpeechRecognition();
  renderAll();
  setInterval(() => {
    if (state.runStartedAt && !state.runCompleted) renderMetrics();
  }, 250);
