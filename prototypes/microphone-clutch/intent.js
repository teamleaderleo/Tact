'use strict';

  function parseVoiceIntent(text) {
    const normalized = normalize(text);
    const previous = state.intent ? clone(state.intent) : null;
    const intent = previous || { action: null, targets: [], reference: null, owner: null };

    if (state.scenarioId === 'request') {
      if (normalized.includes('compare')) intent.action = 'compare';
      else if (normalized.includes('replay') || normalized.includes('rerun')) intent.action = 'replay';
      else if (normalized.includes('inspect') || normalized.includes('open')) intent.action = 'inspect';

      if (state.mode === 'mixed' && state.primary) {
        intent.targets = [state.primary];
        if (intent.referenceRelation === 'previous-successful') intent.reference = previousSuccessfulRequest(state.primary);
      }
      if (state.mode === 'voice') {
        if (normalized.includes('failed') && normalized.includes('profile')) {
          intent.targets = ['req-119'];
        } else {
          const target = findMentionedObject(normalized);
          if (target) intent.targets = [target.id];
        }
      }

      if (normalized.includes('previous') && normalized.includes('successful')) {
        intent.referenceRelation = 'previous-successful';
        intent.reference = previousSuccessfulRequest(intent.targets[0]);
      } else {
        const mentioned = findMentionedObject(normalized, { exclude: intent.targets });
        if (mentioned) intent.reference = mentioned.id;
      }
    }

    if (state.scenarioId === 'merge') {
      if (normalized.includes('merge')) intent.action = 'merge';
      else if (normalized.includes('link')) intent.action = 'link';
      else if (normalized.includes('reassign') || normalized.includes('move')) intent.action = 'reassign';

      if (state.mode === 'mixed' && state.selected.length) {
        intent.targets = [...state.selected];
        if (normalized.includes('this') || normalized.includes('owner')) intent.owner = state.primary;
      }

      if (state.mode === 'voice') {
        const mentionedIds = findAllMentionedObjects(normalized).map((object) => object.id);
        const ownerOnlyCorrection = Boolean(previous && normalized.includes('owner') && !normalized.includes('merge'));
        if (mentionedIds.length && !ownerOnlyCorrection) intent.targets = mentionedIds.slice(0, 2);
        const ownerCandidate = findOwnerMention(normalized);
        if (ownerCandidate) intent.owner = ownerCandidate.id;
      }
    }

    if (state.scenarioId === 'spacing') {
      if (normalized.includes('spacing') || normalized.includes('gap')) intent.action = 'match-spacing';
      if (normalized.includes('width')) intent.action = 'match-width';
      if (normalized.includes('content')) intent.action = 'copy-content';

      if (state.mode === 'mixed' && state.primary) {
        intent.targets = [state.primary];
        if (intent.referenceRelation === 'above') intent.reference = objectAbove(state.primary);
      }
      if (state.mode === 'voice') {
        const target = findMentionedObject(normalized);
        if (target) {
          intent.targets = [target.id];
          if (intent.referenceRelation === 'above') intent.reference = objectAbove(target.id);
        }
      }

      if (normalized.includes('above')) {
        intent.referenceRelation = 'above';
        intent.reference = objectAbove(intent.targets[0]);
      } else {
        const reference = findMentionedObject(normalized, { exclude: intent.targets });
        if (reference) intent.reference = reference.id;
      }
    }

    return intent;
  }

  function findMentionedObject(normalizedText, { exclude = [] } = {}) {
    const candidates = [];
    for (const object of currentScenario().objects) {
      if (exclude.includes(object.id)) continue;
      for (const rawAlias of object.aliases) {
        const alias = normalize(rawAlias);
        const index = normalizedText.indexOf(alias);
        if (index !== -1) candidates.push({ object, alias, index });
      }
    }
    candidates.sort((a, b) => a.index - b.index || b.alias.length - a.alias.length);
    return candidates[0]?.object || null;
  }

  function findAllMentionedObjects(normalizedText) {
    return currentScenario().objects.filter((object) => object.aliases.some((alias) => normalizedText.includes(normalize(alias))));
  }

  function findOwnerMention(normalizedText) {
    const ownerIndex = normalizedText.indexOf('owner');
    if (ownerIndex === -1) return findMentionedObject(normalizedText);
    const prefix = normalizedText.slice(0, ownerIndex);
    const matches = findAllMentionedObjects(prefix);
    return matches.at(-1) || null;
  }

  function previousSuccessfulRequest(targetId) {
    const objects = currentScenario().objects;
    const index = objects.findIndex((object) => object.id === targetId);
    if (index === -1) return null;
    const target = objects[index];
    for (let i = index - 1; i >= 0; i -= 1) {
      const candidate = objects[i];
      if (candidate.status === 'ok' && candidate.title === target.title) return candidate.id;
    }
    return objects.slice(0, index).reverse().find((object) => object.status === 'ok')?.id || null;
  }

  function objectAbove(targetId) {
    const objects = currentScenario().objects;
    const index = objects.findIndex((object) => object.id === targetId);
    return index > 0 ? objects[index - 1].id : null;
  }

  function injectRecognitionMistake(text) {
    const normalized = normalize(text);
    if (state.scenarioId === 'request') {
      if (normalized.includes('compare')) return text.replace(/compare/i, 'replay');
      return `${text} replay`;
    }
    if (state.scenarioId === 'merge') {
      if (normalized.includes('merge')) return text.replace(/merge/i, 'link');
      return `${text} link`;
    }
    if (state.scenarioId === 'spacing') {
      if (/spacing/i.test(text)) return text.replace(/spacing/i, 'width');
      return `${text} width`;
    }
    return text;
  }

  function injectReferentMistake(intent) {
    const next = clone(intent);
    if (state.scenarioId === 'request') {
      next.targets = ['req-120'];
      if (!next.reference) next.reference = 'req-118';
    }
    if (state.scenarioId === 'merge') {
      const targets = next.targets?.length ? [...next.targets] : ['auth-api', 'auth-ui'];
      next.targets = targets.slice(0, 2);
      next.owner = next.owner === 'auth-ui' ? 'auth-api' : 'auth-ui';
    }
    if (state.scenarioId === 'spacing') {
      next.targets = ['actions'];
      if (next.referenceRelation === 'above') next.reference = 'details';
    }
    return next;
  }

  function injectIntentMistake(intent) {
    const next = clone(intent);
    if (state.scenarioId === 'request') next.action = 'inspect';
    if (state.scenarioId === 'merge') next.action = 'link';
    if (state.scenarioId === 'spacing') next.action = 'copy-content';
    return next;
  }

  function performIntent({ repair = false } = {}) {
    if (!state.intent) return;
    const intent = state.intent;
    let outcome;

    if (state.scenarioId === 'request') {
      const target = intent.targets?.[0] || null;
      const reference = intent.reference || null;
      if (intent.action === 'compare') {
        outcome = { kind: 'compare', target, reference, summary: `Compared ${labelForId(target)} with ${labelForId(reference)}.` };
      } else if (intent.action === 'replay') {
        outcome = { kind: 'other', summary: `Replayed ${labelForId(target)} instead of comparing it.` };
      } else {
        outcome = { kind: 'other', summary: `Opened ${labelForId(target)} for inspection.` };
      }
    }

    if (state.scenarioId === 'merge') {
      const targets = intent.targets || [];
      if (intent.action === 'merge') {
        outcome = { kind: 'merge', members: [...targets], owner: intent.owner, summary: `Merged ${targets.map(labelForId).join(' + ')} with ${labelForId(intent.owner)} as owner.` };
      } else if (intent.action === 'link') {
        outcome = { kind: 'other', summary: `Linked ${targets.map(labelForId).join(' + ')}; ownership stayed unchanged.` };
      } else {
        outcome = { kind: 'other', summary: `Reassigned ${labelForId(targets[0])} to ${labelForId(intent.owner)}.` };
      }
    }

    if (state.scenarioId === 'spacing') {
      const target = intent.targets?.[0] || null;
      const reference = intent.reference || null;
      if (intent.action === 'match-spacing') {
        const spacing = objectById(reference)?.spacing ?? intent.spacing ?? null;
        const spacingById = {};
        currentScenario().objects.forEach((object) => { spacingById[object.id] = object.spacing; });
        if (target && Number.isFinite(spacing)) spacingById[target] = spacing;
        outcome = { kind: 'spacing', target, reference, spacingById, summary: `Set ${labelForId(target)} vertical gap to ${spacing ?? '—'} px from ${labelForId(reference)}.` };
      } else if (intent.action === 'set-spacing') {
        const spacingById = {};
        currentScenario().objects.forEach((object) => { spacingById[object.id] = object.spacing; });
        if (target && Number.isFinite(intent.spacing)) spacingById[target] = intent.spacing;
        outcome = { kind: 'spacing', target, reference: null, spacingById, summary: `Set ${labelForId(target)} vertical gap to ${intent.spacing} px.` };
      } else if (intent.action === 'match-width') {
        outcome = { kind: 'other', summary: `Matched ${labelForId(target)} width to ${labelForId(reference)}. Vertical spacing stayed unchanged.` };
      } else {
        outcome = { kind: 'other', summary: `Copied content from ${labelForId(reference)} into ${labelForId(target)}.` };
      }
    }

    state.outcome = outcome;
    const correct = isCorrectOutcome(intent, outcome);
    state.didCorrect = correct;
    state.did = outcome.summary;

    if (!correct && !repair) state.metrics.wrongInterpretations += 1;
    if (!correct && repair) state.metrics.wrongInterpretations += 1;

    renderStage();
    renderInterpretation();
    renderMetrics();

    if (correct) completeRun();
  }

  function isCorrectOutcome(intent, outcome) {
    const expected = currentScenario().expected;

    if (state.scenarioId === 'request') {
      return intent.action === expected.action
        && intent.targets?.[0] === expected.targets[0]
        && intent.reference === expected.reference;
    }

    if (state.scenarioId === 'merge') {
      const actualTargets = [...(intent.targets || [])].sort();
      const expectedTargets = [...expected.targets].sort();
      return intent.action === expected.action
        && JSON.stringify(actualTargets) === JSON.stringify(expectedTargets)
        && intent.owner === expected.owner;
    }

    if (state.scenarioId === 'spacing') {
      if (intent.action === 'set-spacing') {
        return intent.targets?.[0] === expected.targets[0] && intent.spacing === expected.spacing;
      }
      return intent.action === expected.action
        && intent.targets?.[0] === expected.targets[0]
        && intent.reference === expected.reference
        && outcome?.spacingById?.[expected.targets[0]] === expected.spacing;
    }

    return false;
  }
