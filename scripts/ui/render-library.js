(function exposeLibraryRenderer(root, factory) {
  const quickApi = typeof module === 'object' && module.exports
    ? require('./render-quick-case.js')
    : root.AIThinkingQuickUI;
  const api = factory(quickApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingLibraryUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createLibraryRenderer(quickApi) {
  function matchesFilter(caseData, filter, currentIds) {
    if (filter === 'all') return true;
    if (filter === 'fact') return caseData.judgmentType.includes('事实');
    if (filter === 'value') return caseData.judgmentType.includes('价值');
    if (filter === 'current') return currentIds.has(caseData.id);
    return true;
  }

  function renderLibrary(data, activeFilter = 'all') {
    const safe = quickApi.escapeHtml;
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const sourceMap = new Map(sources.map((source) => [source.id, source]));
    const currentSourceIds = new Set(sources.filter((source) => source.current).map((source) => source.id));
    const currentCaseIds = new Set((data.cases || [])
      .filter((item) => (item.sourceIds || []).some((id) => currentSourceIds.has(id)))
      .map((item) => item.id));
    const filters = [
      ['all', '全部案例'],
      ['fact', '事实判断'],
      ['value', '价值判断'],
      ['current', '近期材料'],
    ];
    const controls = filters.map(([id, label]) => `
      <button type="button" data-library-filter="${id}" aria-pressed="${activeFilter === id}">${label}</button>`).join('');
    const cases = (data.cases || []).filter((item) => matchesFilter(item, activeFilter, currentCaseIds));
    const items = cases.map((item) => {
      const sourceLinks = (item.sourceIds || []).slice(0, 5).map((sourceId) => {
        const source = sourceMap.get(sourceId);
        if (!source) return `<li>${safe(sourceId)}</li>`;
        return `<li><a href="${safe(source.url)}" target="_blank" rel="noreferrer">${safe(source.institution)}：${safe(source.title)}</a></li>`;
      }).join('');
      return `
        <details class="library-case">
          <summary>
            <span>${safe(item.judgmentType)}</span>
            <strong>${safe(item.title)}</strong>
            <small>${currentCaseIds.has(item.id) ? '含近期材料，展示前需复核' : `${(item.sourceIds || []).length} 条来源`}</small>
          </summary>
          <div class="library-case-body">
            <p>${safe(item.context)}</p>
            <blockquote>${safe(item.takeaway || '')}</blockquote>
            <div class="library-boundary"><strong>结论边界</strong><p>${safe(item.uncertaintyNote)}</p></div>
            <h4>原始来源</h4>
            <ul>${sourceLinks}</ul>
          </div>
        </details>`;
    }).join('');

    return `
      <section class="knowledge-section library-section" id="library" data-view="library" aria-labelledby="library-title">
        <header>
          <h2 id="library-title">公共案例资料库</h2>
          <p>案例保留事实、争议和未知部分。在线时可继续打开原始来源。</p>
        </header>
        <div class="library-filters" role="group" aria-label="筛选案例">${controls}</div>
        <div class="library-results" aria-live="polite">${items || '<p class="empty-state">这个筛选下暂时没有案例。</p>'}</div>
      </section>`;
  }

  function renderSourceDirectory(data) {
    const safe = quickApi.escapeHtml;
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const items = sources.map((source) => `
      <li>
        <a href="${safe(source.url)}" target="_blank" rel="noreferrer">${safe(source.title)}</a>
        <span>${safe(source.institution)}，${safe(source.date)}，${safe(source.type || '公开资料')}</span>
      </li>`).join('');
    return `
      <section class="knowledge-section source-section" id="sources" data-view="sources" aria-labelledby="sources-title">
        <header>
          <h2 id="sources-title">资料来源与研究方法</h2>
          <p>${sources.length} 条来源均记录机构、日期、用途和结论边界。链接在联网时打开，离线不影响正文。</p>
        </header>
        <details class="source-directory">
          <summary>展开完整来源目录</summary>
          <ol>${items}</ol>
        </details>
        <div class="method-note">
          <h3>我是怎样整理这些材料的</h3>
          <p>优先查找政府部门、法院、大学和国际组织原文，再区分事实、观点、模型结论和未知部分。网页文字与解释图重新编写，不复制新闻图片和长段原文。</p>
          <p><a href="CONTENT_SOURCES.md">查看完整的使用与人工核验记录</a></p>
        </div>
      </section>`;
  }

  return { renderLibrary, renderSourceDirectory };
});
