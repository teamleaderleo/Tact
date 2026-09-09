'use strict';

  function renderAll() {
    renderPrompt();
    renderStage();
    renderDirectControls();
    renderInterpretation();
    renderFailureLab();
    renderMetrics();
    renderResults();
    updateMicAvailability();
    updateRunBadge();
  }

  function renderPrompt() {
    const scenario = currentScenario();
    els.taskPrompt.innerHTML = `
      <strong>${escapeHtml(scenario.prompt)}</strong>
      <p>${escapeHtml(scenario.guidance[state.mode])}</p>
    `;
  }

  function renderStage() {
    if (state.scenarioId === 'request') renderRequestStage();
    if (state.scenarioId === 'merge') renderMergeStage();
    if (state.scenarioId === 'spacing') renderSpacingStage();
  }

  function renderRequestStage() {
    const cards = currentScenario().objects.map(renderObjectCard).join('');
    let result = '';
    if (state.outcome?.kind === 'compare') {
      result = `
        <div class="result-surface">
          <h3>Comparison</h3>
          <div class="result-grid">
            <div class="result-cell"><code>${escapeHtml(labelForId(state.outcome.target))}</code><br>${escapeHtml(objectById(state.outcome.target)?.body || '')}</div>
            <div class="result-cell"><code>${escapeHtml(labelForId(state.outcome.reference))}</code><br>${escapeHtml(objectById(state.outcome.reference)?.body || '')}</div>
          </div>
        </div>`;
    } else if (state.outcome) {
      result = `<div class="result-surface"><h3>Action result</h3>${escapeHtml(state.outcome.summary)}</div>`;
    }
    els.stage.innerHTML = `<div class="request-list">${cards}</div>${result}`;
    bindObjectCardEvents();
  }

  function renderMergeStage() {
    const cards = currentScenario().objects.map(renderObjectCard).join('');
    let result = '';
    if (state.outcome?.kind === 'merge') {
      result = `<div class="result-surface"><h3>Merged work</h3><strong>${escapeHtml(state.outcome.members.map(labelForId).join(' + '))}</strong><div class="card-sub">Owner: ${escapeHtml(labelForId(state.outcome.owner))}</div></div>`;
    } else if (state.outcome) {
      result = `<div class="result-surface"><h3>Action result</h3>${escapeHtml(state.outcome.summary)}</div>`;
    }
    els.stage.innerHTML = `<div class="task-grid">${cards}</div>${result}`;
    bindObjectCardEvents();
  }

  function renderSpacingStage() {
    const sections = currentScenario().objects.map((object) => {
      const selected = state.selected.includes(object.id);
      const primary = state.primary === object.id;
      const disabled = state.mode === 'voice';
      const liveSpacing = state.outcome?.spacingById?.[object.id] ?? object.spacing;
      return `
        <div class="layout-section${selected ? ' selected' : ''}${primary ? ' primary' : ''}${disabled ? ' disabled' : ''}" data-object-id="${object.id}" tabindex="${disabled ? '-1' : '0'}">
          <div class="card-line"><span class="card-title">${escapeHtml(object.title)}</span><span class="card-meta">gap ${liveSpacing} px</span></div>
          <div class="card-sub">${escapeHtml(object.body)}</div>
          <div style="height:${Math.max(10, liveSpacing)}px" aria-hidden="true"></div>
          <div class="card-meta">next content block</div>
        </div>`;
    }).join('');
    let result = '';
    if (state.outcome) {
      result = `<div class="result-surface"><h3>Edit result</h3>${escapeHtml(state.outcome.summary)}</div>`;
    }
    els.stage.innerHTML = `<div class="layout-canvas">${sections}</div>${result}`;
    bindObjectCardEvents();
  }

  function renderObjectCard(object) {
    const selected = state.selected.includes(object.id);
    const primary = state.primary === object.id;
    const disabled = state.mode === 'voice';
    const status = object.status
      ? `<span class="status-pill ${object.status}">${escapeHtml(object.statusLabel)}</span>`
      : '';
    return `
      <div class="artifact-card${selected ? ' selected' : ''}${primary ? ' primary' : ''}${disabled ? ' disabled' : ''}" data-object-id="${object.id}" tabindex="${disabled ? '-1' : '0'}">
        <div class="card-line"><span class="card-title">${escapeHtml(object.title)}</span>${status}</div>
        <div class="card-line"><span class="card-meta">${escapeHtml(object.id)}</span><span class="card-meta">${escapeHtml(object.meta)}</span></div>
        <div class="card-sub">${escapeHtml(object.body)}</div>
      </div>`;
  }

  function bindObjectCardEvents() {
    document.querySelectorAll('[data-object-id]').forEach((element) => {
      const activate = () => handleObjectSelection(element.dataset.objectId);
      element.addEventListener('click', activate);
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  function handleObjectSelection(id) {
    if (state.runCompleted) {
      els.speechStatus.textContent = 'Run complete. Reset to start another pass.';
      return;
    }
    if (state.mode === 'voice') {
      els.speechStatus.textContent = 'Voice-only condition: visible selection does not supply the referent.';
      return;
    }

    recordAction('pointer', `Selected ${labelForId(id)}.`);

    if (state.repairSlot && state.intent) {
      patchIntentFromSelection(id);
      return;
    }

    if (state.scenarioId === 'merge') {
      if (state.selected.includes(id)) {
        state.selected = state.selected.filter((item) => item !== id);
      } else {
        if (state.selected.length >= 2) state.selected.shift();
        state.selected.push(id);
      }
      state.primary = state.selected.includes(id) ? id : state.selected.at(-1) || null;
    } else if (state.scenarioId === 'request' && state.mode === 'pointer') {
      if (state.selected.includes(id)) {
        state.selected = state.selected.filter((item) => item !== id);
      } else {
        if (state.selected.length >= 2) state.selected.shift();
        state.selected.push(id);
      }
      state.primary = state.selected.includes(id) ? id : state.selected.at(-1) || null;
    } else {
      state.selected = [id];
      state.primary = id;
    }

    renderStage();
    renderDirectControls();
    renderInterpretation();
  }

  function patchIntentFromSelection(id) {
    const slot = state.repairSlot;
    state.repairSlot = null;
    if (slot === 'target') state.intent.targets = [id];
    if (slot === 'reference') state.intent.reference = id;
    if (slot === 'owner') state.intent.owner = id;
    if (state.scenarioId === 'spacing' && slot === 'target' && state.intent.referenceRelation === 'above') {
      state.intent.reference = objectAbove(id);
    }
    if (state.scenarioId === 'request' && slot === 'target' && state.intent.referenceRelation === 'previous-successful') {
      state.intent.reference = previousSuccessfulRequest(id);
    }
    state.metrics.repairTurns += 1;
    renderMetrics();
    els.speechStatus.textContent = `Patched ${slot} to ${labelForId(id)}.`;
    performIntent({ repair: true });
  }

  function renderDirectControls() {
    if (state.mode !== 'pointer') {
      els.directControls.innerHTML = '';
      return;
    }

    if (state.scenarioId === 'request') {
      els.directControls.innerHTML = `
        <p class="control-help">Direct baseline: select the failed and prior successful requests. The system compares exactly those two.</p>
        <div class="inline-actions"><button id="directCompareBtn" class="direct-button" type="button">Compare selected</button></div>`;
      document.querySelector('#directCompareBtn').addEventListener('click', directCompare);
    }

    if (state.scenarioId === 'merge') {
      els.directControls.innerHTML = `
        <p class="control-help">Direct baseline: the last selected card is primary. Merge the two selected tasks and keep the primary card's owner.</p>
        <div class="inline-actions"><button id="directMergeBtn" class="direct-button" type="button">Merge selected; keep primary owner</button></div>`;
      document.querySelector('#directMergeBtn').addEventListener('click', directMerge);
    }

    if (state.scenarioId === 'spacing') {
      const selected = objectById(state.primary);
      const current = selected?.spacing ?? '';
      els.directControls.innerHTML = `
        <p class="control-help">Direct baseline: edit the selected section's numeric vertical gap. Use the visible value above as the reference.</p>
        <div class="inline-actions">
          <label for="spacingInput">Vertical gap</label>
          <input id="spacingInput" class="direct-input" inputmode="numeric" value="${escapeHtml(state.pointerSpacingDraft)}" placeholder="${escapeHtml(String(current))}" ${selected ? '' : 'disabled'} />
          <span>px</span>
        </div>`;
      const input = document.querySelector('#spacingInput');
      if (input) {
        let previousLength = input.value.length;
        input.addEventListener('input', () => {
          const delta = Math.max(0, input.value.length - previousLength);
          if (delta) recordTypedCharacters(delta);
          previousLength = input.value.length;
          state.pointerSpacingDraft = input.value;
        });
        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') directSpacing(Number(input.value));
        });
      }
    }
  }

  function directCompare() {
    if (state.runCompleted) return;
    recordAction('pointer', 'Pressed Compare selected.');
    const selectedObjects = state.selected.map((id) => objectById(id)).filter(Boolean);
    const target = selectedObjects.find((object) => object.status === 'fail')?.id || state.selected[0] || null;
    const reference = state.selected.find((id) => id !== target) || null;
    state.heard = '— direct manipulation —';
    state.intent = { action: 'compare', targets: target ? [target] : [], reference, owner: null };
    performIntent();
  }

  function directMerge() {
    if (state.runCompleted) return;
    recordAction('pointer', 'Pressed Merge selected.');
    state.heard = '— direct manipulation —';
    state.intent = { action: 'merge', targets: [...state.selected], owner: state.primary, reference: null };
    performIntent();
  }

  function directSpacing(value) {
    if (state.runCompleted) return;
    recordAction('keyboard', `Committed ${value} px.`);
    const target = state.primary;
    state.heard = '— direct manipulation —';
    state.intent = { action: 'set-spacing', targets: target ? [target] : [], reference: null, owner: null, spacing: value };
    performIntent();
  }

