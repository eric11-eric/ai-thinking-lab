(function exposeTheoryRenderer(root, factory) {
  const quickApi = typeof module === 'object' && module.exports
    ? require('./render-quick-case.js')
    : root.AIThinkingQuickUI;
  const api = factory(quickApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingTheoryUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTheoryRenderer(quickApi) {
  function renderTheoryReview(report, theoryUnits, options = {}) {
    const safe = quickApi.escapeHtml;
    const sectionId = options.id || 'theory';
    const titleId = `${sectionId}-title`;
    const linked = new Set(report.theoryLinks || []);
    const units = (theoryUnits || []).filter((unit) => linked.has(unit.id));
    const content = units.map((unit) => `
      <article class="theory-unit">
        <div class="theory-connection">
          <h3>${safe(unit.title)}</h3>
          <p>${safe(unit.caseConnection)}</p>
          <blockquote>${safe(unit.question)}</blockquote>
        </div>
        <details>
          <summary>展开原理与常见误区</summary>
          <p><strong>原理：</strong>${safe(unit.principle)}</p>
          <p><strong>注意：</strong>${safe(unit.misconception)}</p>
        </details>
      </article>`).join('');

    return `
      <section class="theory-review" id="${safe(sectionId)}" ${options.reference ? 'data-view="theory"' : ''} aria-labelledby="${safe(titleId)}">
        <header>
          <h2 id="${safe(titleId)}">${options.reference ? '认识论主线：人怎样获得可靠认识' : '从刚才的判断回到认识论'}</h2>
          <p>${options.reference ? '先从现实材料和判断问题进入，再展开原理定义与常见误区。' : '原理不是贴在案例后的标签，而是用来解释材料怎样改变认识。'}</p>
        </header>
        <div class="theory-list">${content || '<p>完成实验后，将根据你的行为连接理论。</p>'}</div>
      </section>`;
  }

  return { renderTheoryReview };
});
