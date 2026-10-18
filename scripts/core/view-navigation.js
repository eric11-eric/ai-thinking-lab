(function exposeViewNavigation(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingNavigation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createViewNavigation() {
  const views = ['experiment', 'portraits', 'theory', 'library', 'toolkit', 'sources'];
  const viewSet = new Set(views);
  const advanceTargets = {
    START: '#app',
    SUBMIT_QUICK_JUDGMENT: '.ai-opinion',
    RECORD_AI_REACTION: '#app',
    SELECT_DEEP_CASES: '#app',
    SUBMIT_DEEP_JUDGMENT: '.evidence-workspace',
    SUBMIT_RECONSIDERATION: '#app',
    SUBMIT_FINAL_POSITION: '#report',
  };

  function hashName(hash) {
    return String(hash || '').replace(/^#/, '');
  }

  function isViewHash(hash) {
    return viewSet.has(hashName(hash));
  }

  function normalizeView(hash) {
    const candidate = hashName(hash);
    return viewSet.has(candidate) ? candidate : 'experiment';
  }

  function createViewPlan(hash) {
    const view = normalizeView(hash);
    return {
      view,
      showExperiment: view === 'experiment',
      visibleKnowledgeViews: view === 'experiment' ? [] : [view],
    };
  }

  function getAdvanceTarget(eventType) {
    return advanceTargets[eventType] || null;
  }

  return {
    createViewPlan,
    getAdvanceTarget,
    isViewHash,
    normalizeView,
  };
});
