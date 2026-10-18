(function exposeEvidenceRenderer(root, factory) {
  const quickApi = typeof module === 'object' && module.exports
    ? require('./render-quick-case.js')
    : root.AIThinkingQuickUI;
  const api = factory(quickApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingEvidenceUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createEvidenceRenderer(quickApi) {
  const kindLabels = {
    fact: '事实材料',
    context: '机制与背景',
    position: '立场与关系',
    unknown: '未知与边界',
  };

  function renderEvidenceDrawer(evidence, visited) {
    if (!evidence) return '';
    const safe = quickApi.escapeHtml;
    const sources = (evidence.sourceIds || []).map((id) => `<code>${safe(id)}</code>`).join(' ');
    return `
      <article class="evidence-drawer${visited ? ' is-open' : ''}" data-kind="${safe(evidence.kind)}">
        <button
          class="evidence-trigger"
          type="button"
          data-evidence-id="${safe(evidence.id)}"
          data-evidence-kind="${safe(evidence.kind)}"
          aria-expanded="${Boolean(visited)}"
        >
          <span class="evidence-type">${safe(kindLabels[evidence.kind] || '核验材料')}</span>
          <strong>${safe(evidence.title)}</strong>
          <span class="evidence-status">${visited ? '已查看' : '展开材料'}</span>
        </button>
        ${visited ? `
          <div class="evidence-body reveal-panel">
            <p class="evidence-summary">${safe(evidence.summary)}</p>
            ${evidence.detail ? `<p>${safe(evidence.detail)}</p>` : ''}
            ${evidence.checkQuestion ? `<p class="check-question"><strong>核验问题：</strong>${safe(evidence.checkQuestion)}</p>` : ''}
            <div class="evidence-limit">
              <strong>材料局限</strong>
              <p>${safe(evidence.limitation)}</p>
            </div>
            <p class="evidence-sources"><span>来源索引</span>${sources}</p>
          </div>` : ''}
      </article>`;
  }

  return { kindLabels, renderEvidenceDrawer };
});
