(function exposeDeepRenderer(root, factory) {
  const quickApi = typeof module === 'object' && module.exports
    ? require('./render-quick-case.js')
    : root.AIThinkingQuickUI;
  const evidenceApi = typeof module === 'object' && module.exports
    ? require('./render-evidence.js')
    : root.AIThinkingEvidenceUI;
  const api = factory(quickApi, evidenceApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingDeepUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createDeepRenderer(quickApi, evidenceApi) {
  function optionLabel(caseData, optionId) {
    const match = caseData.options.find((option) => option.id === optionId);
    return match ? match.label : optionId;
  }

  function renderInitialJudgment(caseData) {
    const safe = quickApi.escapeHtml;
    const options = caseData.options.map((option) => `
      <button class="choice-button" type="button" data-deep-choice="${safe(option.id)}">
        <span>${safe(option.label)}</span>
        <span class="choice-mark" aria-hidden="true">选择</span>
      </button>`).join('');
    return `
      <section class="deep-intro-panel">
        <h2>${safe(caseData.question)}</h2>
        <p>先记录你的初始立场，再逐份打开材料。这里没有预设标准答案。</p>
        <div class="choice-list">${options}</div>
      </section>`;
  }

  function renderReconsideration(caseData, deepState, requiredKinds) {
    const safe = quickApi.escapeHtml;
    const answer = deepState.answer;
    const ready = requiredKinds.every((kind) => deepState.visitedEvidenceKinds.includes(kind));
    const options = caseData.options.map((option) => `
      <label class="radio-choice">
        <input type="radio" name="finalChoice" value="${safe(option.id)}" required>
        <span>${safe(option.label)}</span>
      </label>`).join('');
    return `
      <section class="reconsider-panel" aria-labelledby="reconsider-title">
        <div class="before-after-label">
          <span>原始判断</span>
          <strong>${safe(optionLabel(caseData, answer.initialChoice))}</strong>
        </div>
        <h2 id="reconsider-title">${safe(caseData.reconsiderPrompt)}</h2>
        <form id="reconsider-form" data-case-id="${safe(caseData.id)}">
          <fieldset>
            <legend>再次判断</legend>
            <div class="radio-grid">${options}</div>
          </fieldset>
          <fieldset>
            <legend>你主要依据什么？</legend>
            <div class="radio-grid reason-grid">
              <label class="radio-choice"><input type="radio" name="reasonType" value="原始材料改变了判断" required><span>原始材料改变了判断</span></label>
              <label class="radio-choice"><input type="radio" name="reasonType" value="证据支持原判断" required><span>证据支持原判断</span></label>
              <label class="radio-choice"><input type="radio" name="reasonType" value="发现了被遗漏的条件" required><span>发现了被遗漏的条件</span></label>
              <label class="radio-choice"><input type="radio" name="reasonType" value="仍需更多材料" required><span>仍需更多材料</span></label>
            </div>
          </fieldset>
          ${!ready ? '<p class="gate-note" role="status">请先查看每类材料，提交按钮才会启用。</p>' : ''}
          <button class="primary-action" type="submit" data-action="submit-reconsideration" ${ready ? '' : 'disabled'}>提交再次判断</button>
        </form>
      </section>`;
  }

  function renderDeepCase(caseData, deepState = {}) {
    if (!caseData) {
      return '<section class="error-panel" role="alert"><h2>深度案例暂时无法载入</h2><p>请清除记录后重新开始。</p></section>';
    }
    const safe = quickApi.escapeHtml;
    const answer = deepState.answer || {};
    const visitedIds = deepState.visitedEvidenceIds || [];
    const visitedKinds = deepState.visitedEvidenceKinds || [];
    const requiredKinds = [...new Set(caseData.evidence.map((item) => item.kind))];
    const evidence = caseData.evidence.map((item) => evidenceApi.renderEvidenceDrawer(item, visitedIds.includes(item.id))).join('');

    return `
      <article class="deep-stage" data-case-id="${safe(caseData.id)}">
        <header class="deep-heading">
          <p class="case-kicker">${safe(caseData.judgmentType)}的证据核验</p>
          <h1>${safe(caseData.title)}</h1>
          <p>${safe(caseData.context)}</p>
        </header>
        ${!answer.initialChoice ? renderInitialJudgment(caseData) : `
          <section class="evidence-workspace" tabindex="-1">
            <div class="evidence-workspace-heading">
              <h2>逐份打开材料</h2>
              <p>已查看 ${visitedIds.filter((id) => caseData.evidence.some((item) => item.id === id)).length} / ${caseData.evidence.length}</p>
            </div>
            <div class="evidence-grid">${evidence}</div>
          </section>
          ${renderReconsideration(caseData, { ...deepState, answer, visitedEvidenceKinds: visitedKinds }, requiredKinds)}
        `}
      </article>`;
  }

  return { renderDeepCase };
});
