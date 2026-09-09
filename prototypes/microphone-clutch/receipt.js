'use strict';

  function renderInterpretation() {
    const heard = state.heard || '';
    const intent = state.intent;
    const didClass = state.didCorrect === true ? 'good' : state.didCorrect === false ? 'bad' : '';

    els.interpretation.innerHTML = `
      <div class="receipt-block">
        <div class="receipt-label">Heard</div>
        <div class="receipt-value ${heard ? '' : 'receipt-empty'}">${heard ? escapeHtml(heard) : 'Waiting for a command or direct action.'}</div>
      </div>
      <div class="receipt-block">
        <div class="receipt-label">Understood</div>
        <div class="receipt-value ${intent ? '' : 'receipt-empty'}">${intent ? renderIntentEditor(intent) : 'No interpretation yet.'}</div>
      </div>
      <div class="receipt-block did ${didClass}">
        <div class="receipt-label">Did</div>
        <div class="receipt-value ${state.did ? '' : 'receipt-empty'}">${state.did ? escapeHtml(state.did) : 'No action yet.'}</div>
      </div>
      ${intent && !state.runCompleted && state.mode === 'mixed' ? '<div class="context-retained">Context retained. Repair one field, change the visible selection, or keep speaking; the next turn patches this interpretation.</div>' : ''}
      ${intent && !state.runCompleted && state.mode === 'voice' ? '<div class="context-retained">Context retained. Keep speaking; the next voice turn patches this interpretation without requiring the full command again.</div>' : ''}
    `;

    bindIntentEditorEvents();
  }

  function renderIntentEditor(intent) {
    const scenario = currentScenario();
    const visibleActions = scenario.actions.includes(intent.action) || !intent.action ? scenario.actions : [intent.action, ...scenario.actions];
    const actionOptions = visibleActions.map((action) => `<option value="${action}" ${intent.action === action ? 'selected' : ''}>${prettyAction(action)}</option>`).join('');
    const targetText = intent.targets?.length ? intent.targets.map(labelForId).join(' + ') : '—';
    const actionControl = state.mode === 'mixed'
      ? `<select data-intent-field="action">${actionOptions}</select>`
      : `<span class="intent-value">${escapeHtml(prettyAction(intent.action || 'unknown'))}</span>`;
    const targetControl = state.mode === 'mixed'
      ? '<button class="intent-button" data-pick-slot="target" type="button">Pick</button>'
      : '';
    const rows = [
      `<div class="intent-row"><label>Action</label>${actionControl}</div>`,
      `<div class="intent-row"><label>Target</label><span class="intent-value">${escapeHtml(targetText)}</span>${targetControl}</div>`,
    ];

    if (state.scenarioId === 'request' || state.scenarioId === 'spacing') {
      rows.push(`<div class="intent-row"><label>Reference</label><span class="intent-value">${escapeHtml(labelForId(intent.reference))}</span>${state.mode === 'mixed' ? '<button class="intent-button" data-pick-slot="reference" type="button">Pick</button>' : ''}</div>`);
    }

    if (state.scenarioId === 'merge') {
      rows.push(`<div class="intent-row"><label>Owner</label><span class="intent-value">${escapeHtml(labelForId(intent.owner))}</span>${state.mode === 'mixed' ? '<button class="intent-button" data-pick-slot="owner" type="button">Pick</button>' : ''}</div>`);
    }

    if (state.scenarioId === 'spacing' && typeof intent.spacing === 'number') {
      rows.push(`<div class="intent-row"><label>Spacing</label><span class="intent-value">${intent.spacing} px</span></div>`);
    }

    return `<div class="intent-editor">${rows.join('')}</div>`;
  }

  function bindIntentEditorEvents() {
    document.querySelectorAll('[data-intent-field]').forEach((select) => {
      select.addEventListener('change', () => {
        if (!state.intent || state.runCompleted) return;
        const field = select.dataset.intentField;
        if (field === 'action') state.intent.action = select.value;
        if (field === 'target') state.intent.targets = select.value ? [select.value] : [];
        if (field === 'reference') state.intent.reference = select.value || null;
        if (field === 'owner') state.intent.owner = select.value || null;
        recordAction('repair', `Patched ${field}.`);
        performIntent({ repair: true });
      });
    });

    document.querySelectorAll('[data-pick-slot]').forEach((button) => {
      button.addEventListener('click', () => {
        if (state.runCompleted) return;
        state.repairSlot = button.dataset.pickSlot;
        els.speechStatus.textContent = `Pick a visible object to replace ${state.repairSlot}.`;
        renderInterpretation();
      });
    });
  }

  function renderFailureLab() {
    if (state.mode === 'pointer') {
      els.failureLab.innerHTML = '<p class="failure-disabled">Failure injection applies to voice turns. Use the pointer + keyboard condition as the direct baseline.</p>';
      return;
    }

    const options = [
      ['recognition', 'Recognition mistake', 'Changes the heard words before interpretation.'],
      ['referent', 'Wrong referent', 'Keeps the words but binds “this” or the named object to the wrong visible object.'],
      ['intent', 'Wrong intent', 'Keeps words and referent but maps the relationship to the wrong action.'],
    ];

    els.failureLab.innerHTML = options.map(([id, title, description]) => `
      <label class="failure-option">
        <input type="checkbox" data-failure="${id}" ${state.failuresArmed.has(id) ? 'checked' : ''} />
        <strong>${title}</strong>
        <span>${description}</span>
      </label>`).join('') + `<p class="failure-note">Armed failures apply once, on the next voice turn, then disarm for repair.</p>`;

    document.querySelectorAll('[data-failure]').forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) state.failuresArmed.add(input.dataset.failure);
        else state.failuresArmed.delete(input.dataset.failure);
      });
    });
  }
