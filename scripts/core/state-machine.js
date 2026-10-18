(function exposeStateMachine(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStateMachine() {
  const VERSION = 4;

  function uniqueIds(values) {
    return Array.isArray(values) ? [...new Set(values.filter((value) => typeof value === 'string' && value))] : [];
  }

  function normalizeIds(input) {
    if (Array.isArray(input)) return { baseQuestionIds: uniqueIds(input), calibrationPoolIds: [] };
    return {
      baseQuestionIds: uniqueIds(input && (input.baseQuestionIds || input.base)),
      calibrationPoolIds: uniqueIds(input && (input.calibrationPoolIds || input.calibration)),
    };
  }

  function createInitialState(input) {
    const ids = normalizeIds(input);
    return {
      version: VERSION,
      phase: 'intro',
      currentIndex: 0,
      baseQuestionIds: ids.baseQuestionIds,
      calibrationPoolIds: ids.calibrationPoolIds,
      calibrationQuestionIds: [],
      answers: {},
      answerOrder: [],
      startedAt: null,
      updatedAt: null,
      completedAt: null,
      errorCode: null,
    };
  }

  function fail(state, errorCode) {
    return { ...state, errorCode };
  }

  function eventTime(event) {
    return event.at || new Date().toISOString();
  }

  function touch(state, event, changes) {
    return { ...state, ...changes, updatedAt: eventTime(event), errorCode: null };
  }

  function activeQuestionIds(state) {
    if (state.phase === 'base') return state.baseQuestionIds;
    if (state.phase === 'calibration') return state.calibrationQuestionIds;
    return [];
  }

  function allAnswered(state, ids) {
    return ids.every((id) => typeof state.answers[id] === 'string' && state.answers[id]);
  }

  function complete(state, event, changes = {}) {
    return touch(state, event, {
      ...changes,
      phase: 'complete',
      completedAt: eventTime(event),
    });
  }

  function clearCalibration(state) {
    const calibrationIds = new Set(state.calibrationQuestionIds);
    return {
      answers: Object.fromEntries(Object.entries(state.answers).filter(([id]) => !calibrationIds.has(id))),
      answerOrder: state.answerOrder.filter((id) => !calibrationIds.has(id)),
      calibrationQuestionIds: [],
    };
  }

  function reduceExperiment(state, event) {
    if (!state || !event || !event.type) return fail(state || {}, 'invalid-event');

    switch (event.type) {
      case 'START':
        if (state.phase !== 'intro') return fail(state, 'invalid-phase');
        return touch(state, event, {
          phase: state.baseQuestionIds.length > 0 ? 'base' : 'calibration-select',
          currentIndex: 0,
          startedAt: state.startedAt || eventTime(event),
          completedAt: null,
        });

      case 'ANSWER_QUESTION': {
        if (state.phase !== 'base' && state.phase !== 'calibration') return fail(state, 'invalid-phase');
        const ids = activeQuestionIds(state);
        const expectedId = ids[state.currentIndex];
        if (event.questionId !== expectedId) return fail(state, 'unknown-question');
        if (typeof event.optionId !== 'string' || !event.optionId) return fail(state, 'missing-option');
        const answers = { ...state.answers, [event.questionId]: event.optionId };
        const answerOrder = state.answerOrder.includes(event.questionId)
          ? [...state.answerOrder]
          : [...state.answerOrder, event.questionId];
        const isLast = state.currentIndex >= ids.length - 1;
        if (!isLast) {
          return touch(state, event, { answers, answerOrder, currentIndex: state.currentIndex + 1 });
        }
        if (state.phase === 'base') {
          return touch(state, event, { answers, answerOrder, phase: 'calibration-select', currentIndex: 0 });
        }
        const candidate = { ...state, answers };
        if (!allAnswered(candidate, state.baseQuestionIds) || !allAnswered(candidate, state.calibrationQuestionIds)) {
          return fail(state, 'incomplete-answers');
        }
        return complete(state, event, { answers, answerOrder, currentIndex: state.currentIndex });
      }

      case 'SET_CALIBRATION': {
        if (state.phase !== 'calibration-select') return fail(state, 'invalid-phase');
        const selected = uniqueIds(event.questionIds);
        if (selected.length > 5) return fail(state, 'too-many-calibration');
        if (selected.some((id) => !state.calibrationPoolIds.includes(id))) return fail(state, 'unknown-question');
        if (!allAnswered(state, state.baseQuestionIds)) return fail(state, 'incomplete-answers');
        if (selected.length === 0) {
          return complete(state, event, { calibrationQuestionIds: [], currentIndex: 0 });
        }
        return touch(state, event, {
          phase: 'calibration',
          currentIndex: 0,
          calibrationQuestionIds: selected,
          completedAt: null,
        });
      }

      case 'GO_BACK': {
        if (state.phase === 'intro') return fail(state, 'invalid-phase');
        if (state.phase === 'complete') {
          const hasCalibration = state.calibrationQuestionIds.length > 0;
          const ids = hasCalibration ? state.calibrationQuestionIds : state.baseQuestionIds;
          return touch(state, event, {
            phase: hasCalibration ? 'calibration' : 'base',
            currentIndex: Math.max(0, ids.length - 1),
            completedAt: null,
          });
        }
        if (state.phase === 'calibration-select') {
          return touch(state, event, {
            ...clearCalibration(state),
            phase: 'base',
            currentIndex: Math.max(0, state.baseQuestionIds.length - 1),
            completedAt: null,
          });
        }
        if (state.phase === 'calibration' && state.currentIndex === 0) {
          return touch(state, event, {
            ...clearCalibration(state),
            phase: 'base',
            currentIndex: Math.max(0, state.baseQuestionIds.length - 1),
            completedAt: null,
          });
        }
        if (state.phase === 'base' && state.currentIndex === 0) {
          return touch(state, event, { phase: 'intro', currentIndex: 0 });
        }
        return touch(state, event, { currentIndex: Math.max(0, state.currentIndex - 1) });
      }

      case 'RESET':
        return createInitialState({
          baseQuestionIds: state.baseQuestionIds,
          calibrationPoolIds: state.calibrationPoolIds,
        });

      default:
        return fail(state, 'unknown-event');
    }
  }

  function deriveProgress(state) {
    const baseIds = Array.isArray(state && state.baseQuestionIds) ? state.baseQuestionIds : [];
    const calibrationIds = Array.isArray(state && state.calibrationQuestionIds) ? state.calibrationQuestionIds : [];
    const ids = [...baseIds, ...calibrationIds];
    const answers = state && state.answers && typeof state.answers === 'object' ? state.answers : {};
    const answered = ids.filter((id) => typeof answers[id] === 'string' && answers[id]).length;
    const total = ids.length;
    return { answered, total, percent: total ? Math.round((answered / total) * 100) : 0 };
  }

  function isExperimentComplete(state) {
    if (!state || state.phase !== 'complete') return false;
    return allAnswered(state, [...state.baseQuestionIds, ...state.calibrationQuestionIds]);
  }

  return { VERSION, createInitialState, reduceExperiment, deriveProgress, isExperimentComplete };
});
