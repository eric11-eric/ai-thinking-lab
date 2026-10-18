(function exposeReportRenderer(root, factory) {
  const quickApi = typeof module === 'object' && module.exports
    ? require('./render-quick-case.js')
    : root.AIThinkingQuickUI;
  const api = factory(quickApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingReportUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createReportRenderer(quickApi) {
  function renderReplayEntry(item) {
    const safe = quickApi.escapeHtml;
    const isDeep = item.stage === 'deep';
    const theory = (item.theoryLabels || []).map((label) => `<li>${safe(label)}</li>`).join('');
    const later = isDeep
      ? safe(item.finalLabel || item.finalChoice || '未完成')
      : safe(item.aiReaction || '未记录');
    return `
      <details class="report-replay-item">
        <summary>
          <span class="replay-kind">${isDeep ? '证据核验' : 'AI介入'}</span>
          <strong>${safe(item.title)}</strong>
          <span class="replay-change">${safe(item.initialLabel || item.initialChoice || '未记录')} → ${later}</span>
        </summary>
        <div class="replay-body">
          <div><span>先作判断</span><strong>${safe(item.initialLabel || item.initialChoice || '未记录')}</strong></div>
          <div><span>${isDeep ? '打开材料' : '看到AI后'}</span><strong>${isDeep ? `${(item.evidenceViewed || []).length} 份` : later}</strong></div>
          <div><span>${isDeep ? '再次判断' : '这一题留下的记录'}</span><strong>${isDeep ? later : '已记录AI影响'}</strong></div>
          ${item.reasonType ? `<p class="replay-reason"><span>主要依据</span>${safe(item.reasonType)}</p>` : ''}
          ${theory ? `<div class="replay-theory"><span>理论连接</span><ul>${theory}</ul></div>` : ''}
        </div>
      </details>`;
  }

  function renderThinkingReport(report) {
    const safe = quickApi.escapeHtml;
    const replay = (report.timeline || []).map(renderReplayEntry).join('');
    const dimensions = (report.dimensions || []).map((item) => `
      <article class="dimension-item">
        <h3>${safe(item.label)}</h3>
        <p>${safe(item.summary)}</p>
        <span>${(item.evidenceRefs || []).length} 条行为依据</span>
      </article>`).join('');
    const observations = (report.observations || []).map((item) => `
      <li>
        <p>${safe(item.text)}</p>
        <code>${(item.evidenceRefs || []).map(safe).join(' / ')}</code>
      </li>`).join('');
    const suggestions = (report.practiceSuggestions || []).map((item) => `<li>${safe(item)}</li>`).join('');
    const lead = report.lead || {
      headline: '这是你的判断路径。',
      summary: '报告只呈现本次实验中可追溯的选择。',
    };
    const metrics = report.metrics || {};
    const moments = (report.moments || []).map((item, index) => `
      <article class="report-moment${index === 0 ? ' is-lead' : ''}">
        <span>${index === 0 ? '答案变化' : (index === 1 ? 'AI介入' : '证据核验')}</span>
        <h3>${safe(item.title)}</h3>
        <p>${safe(item.text)}</p>
      </article>`).join('');
    const influence = report.aiInfluence || { counts: { accept: 0, question: 0, hold: 0 }, statement: '暂无记录。' };
    const reactionCounts = influence.counts || {};
    const commitments = (report.commitmentOptions || []).map((item) => `
      <label class="commitment-choice">
        <input type="radio" name="commitment" value="${safe(item.id)}">
        <span>
          <strong>${safe(item.label)}${item.recommended ? '<small>建议从这条开始</small>' : ''}</strong>
          <em>${safe(item.detail)}</em>
        </span>
      </label>`).join('');
    const position = report.positionTrace || {};
    const positionTrace = position.initialLabel || position.finalLabel ? `
      <section class="position-trace" aria-labelledby="position-trace-title">
        <h2 id="position-trace-title">同一个问题，两次回答</h2>
        <div class="position-grid">
          <div><span>实验开始前</span><strong>${safe(position.initialLabel || '未记录')}</strong></div>
          <div><span>核验完成后</span><strong>${safe(position.finalLabel || '未记录')}</strong></div>
        </div>
        <p>${position.changed === true ? '回答发生了变化。这里记录的是认识过程，不是给观点打分。' : '回答没有变化。继续坚持也需要说明新材料与原判断的关系。'}</p>
      </section>` : '';

    return `
      <section class="report-stage" id="report" tabindex="-1">
        <header class="report-cover">
          <div class="report-cover-copy">
            <p class="case-kicker">${report.status === 'complete' ? '这次实验留下的记录' : '当前的阶段记录'}</p>
            <h1>${safe(lead.headline)}</h1>
            <p class="report-lead">${safe(lead.summary)}</p>
            <div class="report-cover-actions">
              <span>${safe(report.generatedAt || '')}</span>
              <button class="secondary-action" type="button" data-action="print-report">打印报告</button>
            </div>
          </div>
          <dl class="report-fingerprint" aria-label="本次实验记录数量">
            <div><dt>独立判断</dt><dd>${Number(metrics.independentJudgments || 0)}</dd></div>
            <div><dt>打开材料</dt><dd>${Number(metrics.evidenceViewed || 0)}</dd></div>
            <div><dt>再次判断</dt><dd>${Number(metrics.reconsideredCases || 0)}</dd></div>
          </dl>
        </header>
        ${positionTrace}
        <section class="report-section key-moments" aria-labelledby="moments-title">
          <h2 id="moments-title">三个值得回看的时刻</h2>
          <div class="report-moment-grid">${moments || '<p>继续完成实验，这里会出现关键时刻。</p>'}</div>
        </section>
        <section class="report-section report-replay" aria-labelledby="replay-title">
          <header>
            <h2 id="replay-title">把判断过程重新打开</h2>
            <p>实验分成快速判断和深度核验两组案例。先看完整路径，再按案例回放实际留下的记录。</p>
          </header>
          <ol class="report-replay-chain" aria-label="本次实验的完整判断路径">
            <li><span>01</span><strong>先独立判断</strong></li>
            <li><span>02</span><strong>查看AI意见</strong></li>
            <li><span>03</span><strong>打开核验材料</strong></li>
            <li><span>04</span><strong>完成再次判断</strong></li>
          </ol>
          <div class="report-replay-list">${replay || '<p>完成判断后，这里会出现实验回放。</p>'}</div>
        </section>
        <section class="report-section ai-influence" aria-labelledby="ai-influence-title">
          <div>
            <h2 id="ai-influence-title">AI在这次实验中如何介入</h2>
            <p>${safe(influence.statement)}</p>
          </div>
          <dl class="ai-influence-counts">
            <div data-ai-reaction="accept"><dt>接受</dt><dd>${Number(reactionCounts.accept || 0)}</dd></div>
            <div data-ai-reaction="question"><dt>质疑</dt><dd>${Number(reactionCounts.question || 0)}</dd></div>
            <div data-ai-reaction="hold"><dt>保留</dt><dd>${Number(reactionCounts.hold || 0)}</dd></div>
          </dl>
        </section>
        <details class="report-notebook">
          <summary>展开完整行为依据</summary>
          <div class="report-notebook-grid">
            <section aria-labelledby="dimensions-title">
              <h2 id="dimensions-title">四个观察维度</h2>
              <div class="dimension-grid">${dimensions}</div>
            </section>
            <section class="report-observations" aria-labelledby="observations-title">
              <h2 id="observations-title">从记录中可以确认什么</h2>
              <ol>${observations || '<li><p>当前记录还不足以形成行为观察。</p></li>'}</ol>
            </section>
            <section class="report-suggestions" aria-labelledby="suggestions-title">
              <h2 id="suggestions-title">报告给出的下一步</h2>
              <ul>${suggestions}</ul>
            </section>
          </div>
        </details>
        <section class="practice-next" aria-labelledby="practice-next-title">
          <h2 id="practice-next-title">带走一条自己的规则</h2>
          <p>选择一条，作为下一次使用AI时的行动提醒。</p>
          <form class="commitment-form">
            <fieldset>
              <legend>我准备</legend>
              <div class="commitment-options">${commitments}</div>
            </fieldset>
          </form>
        </section>
      </section>`;
  }

  return { renderThinkingReport };
});
