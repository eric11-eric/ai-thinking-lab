(function exposePortraitAtlasState(root, factory) {
  const portraitEngine = typeof module === 'object' && module.exports
    ? require('./portrait-engine.js')
    : root.AIThinkingPortraitEngine;
  const api = factory(portraitEngine);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingPortraitAtlasState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPortraitAtlasStateApi(portraitEngine) {
  function validIds(portraitTypes) {
    return (portraitTypes || [])
      .map((portrait) => portrait && portrait.id)
      .filter((id) => typeof id === 'string' && id);
  }

  function createAtlasState(portraitTypes = [], selectedId = '') {
    const ids = validIds(portraitTypes);
    return {
      selectedId: ids.includes(selectedId) ? selectedId : (ids[0] || ''),
      ownId: '',
    };
  }

  function selectAtlasPortrait(state = {}, portraitId, portraitTypes = []) {
    const ids = validIds(portraitTypes);
    const current = ids.includes(state.selectedId) ? state.selectedId : (ids[0] || '');
    return {
      selectedId: ids.includes(portraitId) ? portraitId : current,
      ownId: ids.includes(state.ownId) ? state.ownId : '',
    };
  }

  function syncOwnPortrait(state = {}, ownPortraitId, portraitTypes = []) {
    const ids = validIds(portraitTypes);
    const previousOwnId = ids.includes(state.ownId) ? state.ownId : '';
    const ownId = ids.includes(ownPortraitId) ? ownPortraitId : '';
    let selectedId = ids.includes(state.selectedId) ? state.selectedId : (ids[0] || '');
    if (ownId && ownId !== previousOwnId) selectedId = ownId;
    return { selectedId, ownId };
  }

  function deriveOwnPortraitId(experimentState, data = {}) {
    if (!experimentState || experimentState.phase !== 'complete') return '';
    const result = portraitEngine.buildPortraitResult({
      answers: experimentState.answers,
      questions: data.portraitQuestions || [],
      portraitTypes: data.portraitTypes || [],
    });
    return result && result.type ? result.type.id : '';
  }

  return { createAtlasState, selectAtlasPortrait, syncOwnPortrait, deriveOwnPortraitId };
});
