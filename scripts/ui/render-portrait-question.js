(function exposePortraitQuestionRenderer(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingPortraitQuestionUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPortraitQuestionRenderer() {
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderPortraitIntro() {
    return `
      <section class="portrait-test-stage portrait-intro" id="experiment" aria-labelledby="portrait-intro-title">
        <div class="portrait-intro-copy">
          <p class="hero-kicker">AI 时代思考画像</p>
          <h1 id="portrait-intro-title">AI能代替我思考吗？</h1>
          <p class="hero-summary">用 25 至 30 个日常选择，看见你在 AI 介入时如何判断。</p>
          <div class="portrait-intro-actions">
            <button class="primary-action" type="button" data-action="portrait-start">开始测试</button>
            <span>4 至 5 分钟</span>
          </div>
        </div>
        <aside class="portrait-intro-note" aria-label="测试说明">
          <p>这不是心理诊断，也不给人格定型。</p>
          <p>每道题都没有标准答案，按你最可能的做法选。</p>
          <p>结果在本地生成，回答只保存在当前设备。</p>
        </aside>
      </section>`;
  }

  function renderPortraitQuestion(question, viewState = {}) {
    if (!question) {
      return '<section class="portrait-test-stage error-panel" role="alert"><h1>暂时无法载入这道题</h1><p>请检查本地题库文件是否完整。</p><button type="button" data-action="reset">重新开始</button></section>';
    }
    const current = Number(viewState.current) || 1;
    const total = Number(viewState.total) || 1;
    const answered = Number(viewState.answered) || 0;
    const selected = viewState.selectedOptionId || null;
    const options = (Array.isArray(question.options) ? question.options : []).map((option, index) => `
      <button
        class="portrait-option${selected === option.id ? ' is-selected' : ''}"
        type="button"
        data-portrait-option="${escapeHtml(option.id)}"
        aria-pressed="${selected === option.id ? 'true' : 'false'}"
      >
        <span aria-hidden="true">${String.fromCharCode(65 + index)}</span>
        <strong>${escapeHtml(option.label)}</strong>
      </button>`).join('');
    return `
      <section class="portrait-test-stage" data-question-id="${escapeHtml(question.id)}" aria-labelledby="portrait-question-title" tabindex="-1">
        <header class="portrait-question-header">
          <button class="text-action portrait-back" type="button" data-action="portrait-back">返回上一题</button>
          <div class="portrait-progress" role="status" aria-label="测试进度">
            <span>第 ${current} / ${total} 题</span>
            <span>已回答 ${answered} 题</span>
          </div>
        </header>
        <div class="portrait-question-copy">
          <p>${escapeHtml(question.context)}</p>
          <h1 id="portrait-question-title">${escapeHtml(question.prompt)}</h1>
        </div>
        <div class="answer-options" role="group" aria-labelledby="portrait-question-title">${options}</div>
        <p class="portrait-auto-note">选择后会自动进入下一题</p>
      </section>`;
  }

  function renderCalibrationTransition() {
    return `
      <section class="portrait-test-stage portrait-calibration-transition" tabindex="-1">
        <p class="hero-kicker">基础题已完成</p>
        <h1>再回答几道题，让画像更清楚。</h1>
        <p>本地规则正在查看哪些维度需要补充，最多追加 5 道。</p>
      </section>`;
  }

  return { escapeHtml, renderPortraitIntro, renderPortraitQuestion, renderCalibrationTransition };
});
