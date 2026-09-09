'use strict';

  function renderMetrics() {
    const elapsed = state.runStartedAt ? ((performance.now() - state.runStartedAt) / 1000).toFixed(1) : '0.0';
    els.liveMetrics.innerHTML = `
      <h3>Current run</h3>
      ${metricRow('Elapsed', `${elapsed} s`)}
      ${metricRow('Actions', state.metrics.actions)}
      ${metricRow('Voice turns', state.metrics.voiceTurns)}
      ${metricRow('Spoken words', state.metrics.spokenWords)}
      ${metricRow('Referent words', state.metrics.referentWords)}
      ${metricRow('Typed chars', state.metrics.typedChars)}
      ${metricRow('Repair turns', state.metrics.repairTurns)}
      ${metricRow('Wrong interpretations', state.metrics.wrongInterpretations)}
    `;
  }

  function metricRow(label, value) {
    return `<div class="metric-row"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function updateRunBadge() {
    els.runStateBadge.classList.remove('running', 'complete');
    if (state.runCompleted) {
      els.runStateBadge.textContent = 'Complete';
      els.runStateBadge.classList.add('complete');
    } else if (state.runStartedAt) {
      els.runStateBadge.textContent = 'Running';
      els.runStateBadge.classList.add('running');
    } else {
      els.runStateBadge.textContent = 'Ready';
    }
  }

  function updateMicAvailability() {
    const enabled = state.mode !== 'pointer';
    els.micButton.disabled = !enabled;
    els.simulatedUtterance.disabled = !enabled;
    els.simulateBtn.disabled = !enabled;
    els.micHelp.textContent = enabled
      ? 'Hold the button or Space. Release to interpret. You can click/select between voice turns in mixed mode.'
      : 'Voice is disabled in the pointer + keyboard baseline.';
  }

  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      els.speechStatus.textContent = 'Speech recognition is unavailable here. Use “Simulate a voice turn” for deterministic runs.';
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      isListening = true;
      recognitionTranscript = '';
      els.micButton.classList.add('listening');
      els.micButton.setAttribute('aria-pressed', 'true');
      els.micLabel.textContent = 'Listening… release to commit';
      els.speechStatus.textContent = 'Listening…';
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      recognitionTranscript = transcript.trim();
      els.speechStatus.textContent = recognitionTranscript || 'Listening…';
    };

    recognition.onend = () => {
      const transcript = recognitionTranscript.trim();
      isListening = false;
      els.micButton.classList.remove('listening');
      els.micButton.setAttribute('aria-pressed', 'false');
      els.micLabel.textContent = 'Hold to speak';
      if (transcript) commitVoiceTurn(transcript);
      else if (state.mode !== 'pointer') els.speechStatus.textContent = 'No speech captured.';
    };

    recognition.onerror = (event) => {
      isListening = false;
      els.micButton.classList.remove('listening');
      els.micButton.setAttribute('aria-pressed', 'false');
      els.micLabel.textContent = 'Hold to speak';
      els.speechStatus.textContent = `Speech error: ${event.error}. You can use the deterministic simulator below.`;
    };
  }

  function startListening() {
    if (state.mode === 'pointer' || state.runCompleted || isListening) return;
    if (!recognition) {
      els.speechStatus.textContent = 'Speech recognition unavailable. Open the simulator below.';
      return;
    }
    try {
      recognition.start();
    } catch (error) {
      els.speechStatus.textContent = 'Microphone is already starting. Try again.';
    }
  }

  function stopListening() {
    if (!recognition || !isListening) return;
    recognition.stop();
  }

  function commitVoiceTurn(rawTranscript) {
    if (state.mode === 'pointer' || !rawTranscript.trim() || state.runCompleted) return;
    recordAction('voice');
    state.metrics.spokenWords += wordCount(rawTranscript);
    state.metrics.referentWords += countReferentWords(rawTranscript);

    let heard = rawTranscript.trim();
    const armedNow = new Set(state.failuresArmed);
    if (armedNow.has('recognition')) {
      heard = injectRecognitionMistake(heard);
      state.failuresUsed.add('recognition');
    }

    state.heard = heard;
    let intent = parseVoiceIntent(heard);

    if (armedNow.has('referent')) {
      intent = injectReferentMistake(intent);
      state.failuresUsed.add('referent');
    }
    if (armedNow.has('intent')) {
      intent = injectIntentMistake(intent);
      state.failuresUsed.add('intent');
    }

    state.failuresArmed.clear();
    state.intent = intent;
    performIntent();
    renderFailureLab();
  }
