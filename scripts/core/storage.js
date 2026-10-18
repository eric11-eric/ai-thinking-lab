(function exposeStorage(root, factory) {
  const stateApi = typeof module === 'object' && module.exports
    ? require('./state-machine.js')
    : root.AIThinkingState;
  const api = factory(stateApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingStorage = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStorage(stateApi) {
  function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  function isUniqueStringArray(value) {
    return Array.isArray(value)
      && value.every((item) => typeof item === 'string' && item)
      && new Set(value).size === value.length;
  }

  function hasAnswer(answers, id) {
    return typeof answers[id] === 'string' && answers[id].length > 0;
  }

  function isValidState(state) {
    const phases = new Set(['intro', 'base', 'calibration-select', 'calibration', 'complete']);
    if (!isRecord(state) || !phases.has(state.phase)) return false;
    if (!Number.isInteger(state.currentIndex) || state.currentIndex < 0) return false;
    if (!isUniqueStringArray(state.baseQuestionIds)) return false;
    if (!isUniqueStringArray(state.calibrationPoolIds)) return false;
    if (!isUniqueStringArray(state.calibrationQuestionIds)) return false;
    if (!isUniqueStringArray(state.answerOrder)) return false;
    if (!isRecord(state.answers)) return false;
    if (state.calibrationQuestionIds.length > 5) return false;
    if (state.calibrationQuestionIds.some((id) => !state.calibrationPoolIds.includes(id))) return false;

    const allowedAnswerIds = new Set([...state.baseQuestionIds, ...state.calibrationQuestionIds]);
    if (Object.entries(state.answers).some(([id, optionId]) => !allowedAnswerIds.has(id) || typeof optionId !== 'string' || !optionId)) return false;
    if (state.answerOrder.some((id) => !hasAnswer(state.answers, id))) return false;
    if (new Set(Object.keys(state.answers)).size !== state.answerOrder.length) return false;

    if (state.phase === 'base' && (state.baseQuestionIds.length === 0 || state.currentIndex >= state.baseQuestionIds.length)) return false;
    if (state.phase === 'calibration' && (state.calibrationQuestionIds.length === 0 || state.currentIndex >= state.calibrationQuestionIds.length)) return false;
    if ((state.phase === 'intro' || state.phase === 'calibration-select') && state.currentIndex !== 0) return false;
    if (state.phase !== 'intro' && (typeof state.startedAt !== 'string' || !state.startedAt)) return false;
    if (state.phase === 'complete') {
      if (typeof state.completedAt !== 'string' || !state.completedAt) return false;
      if (![...state.baseQuestionIds, ...state.calibrationQuestionIds].every((id) => hasAnswer(state.answers, id))) return false;
    }
    return true;
  }

  function loadProgress(storage, key) {
    let raw;
    try {
      raw = storage.getItem(key);
    } catch (error) {
      return { status: 'unavailable', state: null };
    }
    if (raw === null) return { status: 'empty', state: null };

    let state;
    try {
      state = JSON.parse(raw);
    } catch (error) {
      return { status: 'corrupt', state: null };
    }
    if (!state || state.version !== stateApi.VERSION) return { status: 'version-mismatch', state: null };
    if (!isValidState(state)) return { status: 'corrupt', state: null };
    return { status: 'ok', state };
  }

  function saveProgress(storage, key, state) {
    try {
      storage.setItem(key, JSON.stringify(state));
      return { ok: true };
    } catch (error) {
      return { ok: false, errorCode: 'write-failed' };
    }
  }

  function clearProgress(storage, key) {
    try {
      storage.removeItem(key);
      return { ok: true };
    } catch (error) {
      return { ok: false, errorCode: 'clear-failed' };
    }
  }

  return { loadProgress, saveProgress, clearProgress, isValidState };
});
