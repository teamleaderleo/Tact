  'use strict';

  const STORAGE_KEY = 'tact-clutch-lab-results-v1';

  const MODE_LABELS = {
    pointer: 'Pointer + keyboard',
    voice: 'Voice-only',
    mixed: 'Mixed voice + selection',
  };

  const FAILURE_LABELS = {
    recognition: 'Recognition mistake',
    referent: 'Ambiguous/wrong referent',
    intent: 'Wrong intent interpretation',
  };

  const scenarios = {
    request: {
      label: 'Failed request',
      prompt: 'Compare the failed profile request with the previous successful profile request.',
      guidance: {
        pointer: 'Select both requests, then press “Compare selected”.',
        voice: 'Say the complete target aloud, for example: “compare the failed profile request with the previous successful profile request.”',
        mixed: 'Select the failed request, then say: “compare this with the previous successful one.”',
      },
      expected: {
        action: 'compare',
        targets: ['req-119'],
        reference: 'req-118',
      },
      objects: [
        {
          id: 'req-118',
          type: 'request',
          title: 'POST /api/profile',
          meta: '11:41:08 · 218 ms',
          status: 'ok',
          statusLabel: '200',
          body: 'payload: {displayName: "Leo"} · response: persisted',
          aliases: ['previous successful profile request', 'successful profile request', 'request 118', 'req 118'],
        },
        {
          id: 'req-119',
          type: 'request',
          title: 'POST /api/profile',
          meta: '11:44:19 · 481 ms',
          status: 'fail',
          statusLabel: '500',
          body: 'payload: {displayName: "Leo"} · response: missing session.user.id',
          aliases: ['failed profile request', 'failing profile request', 'request 119', 'req 119'],
        },
        {
          id: 'req-120',
          type: 'request',
          title: 'GET /api/session',
          meta: '11:45:02 · 63 ms',
          status: 'ok',
          statusLabel: '200',
          body: 'session refresh · user id present',
          aliases: ['session request', 'request 120', 'req 120'],
        },
      ],
      actions: ['compare', 'replay', 'inspect'],
    },
    merge: {
      label: 'Merge work',
      prompt: 'Merge Auth API and Auth UI work, keeping Auth UI as the owner.',
      guidance: {
        pointer: 'Select Auth API, then Auth UI so Auth UI is primary. Press “Merge selected; keep primary owner”.',
        voice: 'Name both objects and the owner aloud, for example: “merge Auth API and Auth UI and keep Auth UI as owner.”',
        mixed: 'Select Auth API, then Auth UI so Auth UI is primary. Say: “keep this one as owner and merge the work.”',
      },
      expected: {
        action: 'merge',
        targets: ['auth-api', 'auth-ui'],
        owner: 'auth-ui',
      },
      objects: [
        {
          id: 'auth-api',
          type: 'task',
          title: 'Auth API',
          meta: 'owner Ben · 3 files',
          body: 'Refresh-token endpoint, session serializer, API tests',
          aliases: ['auth api', 'api auth task'],
        },
        {
          id: 'auth-ui',
          type: 'task',
          title: 'Auth UI',
          meta: 'owner Maya · 4 files',
          body: 'Login form, callback state, error copy, browser verification',
          aliases: ['auth ui', 'ui auth task'],
        },
        {
          id: 'billing',
          type: 'task',
          title: 'Billing retry',
          meta: 'owner Nina · 2 files',
          body: 'Idempotency guard and retry telemetry',
          aliases: ['billing retry', 'billing task'],
        },
      ],
      actions: ['merge', 'link', 'reassign'],
    },
    spacing: {
      label: 'Spacing edit',
      prompt: 'Make the Details panel use the same vertical spacing as the Summary section above it.',
      guidance: {
        pointer: 'Select Details, inspect Summary’s 24 px spacing, enter 24 in the spacing field, then press Enter.',
        voice: 'Name both sections aloud, for example: “match the Details panel spacing to the Summary section above.”',
        mixed: 'Select Details, then say: “match this spacing to the section above.”',
      },
      expected: {
        action: 'match-spacing',
        targets: ['details'],
        reference: 'summary',
        spacing: 24,
      },
      objects: [
        {
          id: 'summary',
          type: 'section',
          title: 'Summary',
          meta: 'vertical gap 24 px',
          spacing: 24,
          body: 'Status, owner, last verified revision',
          aliases: ['summary section', 'summary'],
        },
        {
          id: 'details',
          type: 'section',
          title: 'Details',
          meta: 'vertical gap 12 px',
          spacing: 12,
          body: 'Request metadata, logs, source links',
          aliases: ['details panel', 'details section', 'details'],
        },
        {
          id: 'actions',
          type: 'section',
          title: 'Actions',
          meta: 'vertical gap 16 px',
          spacing: 16,
          body: 'Replay, compare, open source',
          aliases: ['actions section', 'actions'],
        },
      ],
      actions: ['match-spacing', 'match-width', 'copy-content'],
    },
  };

  const els = {
    stage: document.querySelector('#stage'),
    taskPrompt: document.querySelector('#taskPrompt'),
    directControls: document.querySelector('#directControls'),
    interpretation: document.querySelector('#interpretation'),
    failureLab: document.querySelector('#failureLab'),
    liveMetrics: document.querySelector('#liveMetrics'),
    micDock: document.querySelector('#micDock'),
    micButton: document.querySelector('#micButton'),
    micLabel: document.querySelector('#micLabel'),
    micHelp: document.querySelector('#micHelp'),
    speechStatus: document.querySelector('#speechStatus'),
    simulatedUtterance: document.querySelector('#simulatedUtterance'),
    simulateBtn: document.querySelector('#simulateBtn'),
    resetRunBtn: document.querySelector('#resetRunBtn'),
    exportBtn: document.querySelector('#exportBtn'),
    clearResultsBtn: document.querySelector('#clearResultsBtn'),
    resultsBody: document.querySelector('#resultsBody'),
    comparisonSummary: document.querySelector('#comparisonSummary'),
    runStateBadge: document.querySelector('#runStateBadge'),
  };

  let recognition = null;
  let isListening = false;
  let recognitionTranscript = '';

  const state = {
    mode: 'pointer',
    scenarioId: 'request',
    selected: [],
    primary: null,
    intent: null,
    heard: '',
    did: '',
    didCorrect: null,
    outcome: null,
    runStartedAt: null,
    runCompleted: false,
    metrics: emptyMetrics(),
    failuresArmed: new Set(),
    failuresUsed: new Set(),
    repairSlot: null,
    pointerSpacingDraft: '',
    results: [],
  };

  function emptyMetrics() {
    return {
      actions: 0,
      voiceTurns: 0,
      spokenWords: 0,
      referentWords: 0,
      typedChars: 0,
      repairTurns: 0,
      wrongInterpretations: 0,
    };
  }

  function currentScenario() {
    return scenarios[state.scenarioId];
  }

  function objectById(id) {
    return currentScenario().objects.find((object) => object.id === id) || null;
  }

  function labelForId(id) {
    const object = objectById(id);
    return object ? object.title : id || '—';
  }

  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[“”"'’.,!?;:()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function wordCount(text) {
    const value = normalize(text);
    return value ? value.split(' ').length : 0;
  }

  function countReferentWords(text) {
    const normalized = normalize(text);
    let total = 0;
    for (const object of currentScenario().objects) {
      const aliases = [...object.aliases].map(normalize).sort((a, b) => b.length - a.length);
      const match = aliases.find((alias) => normalized.includes(alias));
      if (!match) continue;
      const occurrences = normalized.split(match).length - 1;
      total += occurrences * wordCount(match);
    }
    return total;
  }

  function startRunIfNeeded() {
    if (!state.runStartedAt) {
      state.runStartedAt = performance.now();
      updateRunBadge();
    }
  }

  function recordAction(kind, detail = '') {
    if (state.runCompleted) return;
    startRunIfNeeded();
    state.metrics.actions += 1;
    if (kind === 'voice') state.metrics.voiceTurns += 1;
    if (kind === 'repair') state.metrics.repairTurns += 1;
    renderMetrics();
    if (detail) els.speechStatus.textContent = detail;
  }

  function recordTypedCharacters(count) {
    if (state.runCompleted || count <= 0) return;
    startRunIfNeeded();
    state.metrics.typedChars += count;
    renderMetrics();
  }

  function resetRun({ keepModeScenario = true } = {}) {
    state.selected = [];
    state.primary = null;
    state.intent = null;
    state.heard = '';
    state.did = '';
    state.didCorrect = null;
    state.outcome = null;
    state.runStartedAt = null;
    state.runCompleted = false;
    state.metrics = emptyMetrics();
    state.failuresArmed.clear();
    state.failuresUsed = new Set();
    state.repairSlot = null;
    state.pointerSpacingDraft = '';
    recognitionTranscript = '';
    els.speechStatus.textContent = '';
    if (!keepModeScenario) {
      state.mode = 'pointer';
      state.scenarioId = 'request';
    }
    renderAll();
  }

  function setMode(mode) {
    state.mode = mode;
    state.failuresArmed.clear();
    resetRun();
  }

  function setScenario(scenarioId) {
    state.scenarioId = scenarioId;
    state.failuresArmed.clear();
    resetRun();
  }

