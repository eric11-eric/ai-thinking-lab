(function exposeQuickRenderer(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingQuickUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createQuickRenderer() {
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderOptions(caseData, answerState) {
    return caseData.options.map((option) => {
      const selected = answerState.initialChoice === option.id;
      return `
        <button
          class="choice-button${selected ? ' is-selected' : ''}"
          type="button"
          data-choice="${escapeHtml(option.id)}"
          aria-pressed="${selected}"
          ${answerState.phase === 'quick-ai' ? 'disabled' : ''}
        >
          <span>${escapeHtml(option.label)}</span>
          <span class="choice-mark" aria-hidden="true">${selected ? '已选' : '选择'}</span>
        </button>`;
    }).join('');
  }

  function renderAiOpinion(caseData) {
    const claims = caseData.aiOpinion.claims.map((claim) => `
      <li class="claim-row" data-claim-type="${escapeHtml(claim.type)}">
        <span class="claim-label">${escapeHtml(claim.label)}</span>
        <span>${escapeHtml(claim.text)}</span>
      </li>`).join('');
    return `
      <section class="ai-opinion reveal-panel" aria-labelledby="ai-opinion-title" tabindex="-1">
        <div class="ai-opinion-heading">
          <span class="source-stamp">AI意见</span>
          <h3 id="ai-opinion-title">先别急着同意</h3>
        </div>
        <blockquote>${escapeHtml(caseData.aiOpinion.summary)}</blockquote>
        <ul class="claim-list" aria-label="AI回答拆解">${claims}</ul>
        <fieldset class="reaction-fieldset">
          <legend>这段AI意见对你的影响是：</legend>
          <div class="reaction-grid">
            <button type="button" data-reaction="accept">接受它的判断</button>
            <button type="button" data-reaction="question">发现问题，想质疑</button>
            <button type="button" data-reaction="hold">暂时保留意见</button>
          </div>
        </fieldset>
      </section>`;
  }

  function renderQuickCase(caseData, answerState = {}) {
    if (!caseData) {
      return '<section class="error-panel" role="alert"><h2>案例暂时无法载入</h2><p>请返回入口重新开始，或清除本地记录后再试。</p></section>';
    }
    const showAi = answerState.phase === 'quick-ai' && answerState.initialChoice;
    return `
      <article class="case-stage" data-case-id="${escapeHtml(caseData.id)}">
        <header class="case-heading">
          <p class="case-kicker">${escapeHtml(caseData.judgmentType)}</p>
          <h1>${escapeHtml(caseData.title)}</h1>
          <p class="case-context">${escapeHtml(caseData.context)}</p>
        </header>
        <section class="judgment-panel" aria-labelledby="case-question">
          <div class="question-number" aria-hidden="true">?</div>
          <div>
            <h2 id="case-question">${escapeHtml(caseData.question)}</h2>
            <p class="decision-note">先形成自己的判断。选择后，AI意见才会出现。</p>
          </div>
          <div class="choice-list">${renderOptions(caseData, answerState)}</div>
        </section>
        ${showAi ? renderAiOpinion(caseData) : ''}
      </article>`;
  }

  return { escapeHtml, renderQuickCase };
});
