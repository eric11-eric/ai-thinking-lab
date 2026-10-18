(function exposePortraitAtlasRenderer(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingPortraitAtlasUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPortraitAtlasRenderer() {
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function resolveRecords(data = {}) {
    const analyses = new Map((data.portraitAnalyses || []).map((item) => [item.portraitId, item]));
    return (data.portraitTypes || []).flatMap((portrait) => {
      const analysis = analyses.get(portrait.id);
      return portrait && portrait.id && analysis ? [{ portrait, analysis }] : [];
    });
  }

  function renderDirectory(records, selectedId, ownId) {
    return records.map(({ portrait }, index) => {
      const selected = portrait.id === selectedId;
      const isOwn = portrait.id === ownId;
      return `
        <button class="portrait-atlas-control${selected ? ' is-selected' : ''}${isOwn ? ' is-own-portrait' : ''}"
          type="button" data-portrait-atlas-id="${escapeHtml(portrait.id)}" aria-pressed="${selected}"
          aria-controls="portrait-atlas-detail">
          <span class="portrait-atlas-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="portrait-atlas-name">${escapeHtml(portrait.title)}</span>
          ${isOwn ? '<span class="portrait-atlas-own-marker">我的画像</span>' : ''}
        </button>`;
    }).join('');
  }

  function renderTheoryPrinciples(analysis, theoryUnits) {
    const theoryMap = new Map((theoryUnits || []).map((unit) => [unit.id, unit]));
    const resolved = (analysis.theoryLinks || []).map((id) => theoryMap.get(id)).filter(Boolean);
    return resolved.map((unit) => `
      <article class="portrait-atlas-principle" data-theory-id="${escapeHtml(unit.id)}">
        <h4>${escapeHtml(unit.title)}</h4>
        <p>${escapeHtml(unit.principle)}</p>
      </article>`).join('');
  }

  function renderDetail(record, theoryUnits) {
    const { portrait, analysis } = record;
    const theoryPrinciples = renderTheoryPrinciples(analysis, theoryUnits);
    return `
      <article class="portrait-atlas-detail" id="portrait-atlas-detail" aria-labelledby="portrait-atlas-detail-title">
        <header class="portrait-atlas-detail-heading">
          <p>THINKING PORTRAIT / ${escapeHtml(portrait.dimensions && portrait.dimensions.length > 1 ? '双维画像' : '单维画像')}</p>
          <h2 id="portrait-atlas-detail-title" tabindex="-1">${escapeHtml(portrait.title)}</h2>
          <p>${escapeHtml(portrait.coreDescription)}</p>
        </header>

        <div class="portrait-atlas-balance">
          <section><h3>这种力量</h3><p>${escapeHtml(portrait.strength)}</p></section>
          <section><h3>需要留意</h3><p>${escapeHtml(portrait.blindSpot)}</p></section>
        </div>

        <section class="portrait-atlas-plain">
          <p class="section-kicker">先说人话</p>
          <h3>这种画像怎样作出判断</h3>
          <p>${escapeHtml(analysis.plainReading)}</p>
        </section>

        <div class="portrait-atlas-lenses">
          <section><h3>它在什么条件下成立</h3><p>${escapeHtml(analysis.conditions)}</p></section>
          <section><h3>主要矛盾在哪里</h3><p>${escapeHtml(analysis.mainContradiction)}</p></section>
          <section><h3>从实践看</h3><p>${escapeHtml(analysis.practiceAnalysis)}</p></section>
          <section><h3>从人的主体性看</h3><p>${escapeHtml(analysis.subjectAnalysis)}</p></section>
          <section><h3>从人的发展看</h3><p>${escapeHtml(analysis.developmentAnalysis)}</p></section>
          <section><h3>最容易误解的地方</h3><p>${escapeHtml(analysis.misunderstanding)}</p></section>
        </div>

        <section class="portrait-atlas-theory" aria-label="对应的马原原理">
          <p class="section-kicker">马原对照</p>
          <h3>这张画像可以从哪些原理继续理解</h3>
          <div>${theoryPrinciples}</div>
        </section>

        <section class="portrait-atlas-exercise">
          <p class="section-kicker">回到实践</p>
          <h3>不要只认领一个名字</h3>
          <p>${escapeHtml(analysis.practiceExercise)}</p>
        </section>
      </article>`;
  }

  function renderPortraitAtlas(data = {}, options = {}) {
    const records = resolveRecords(data);
    if (!records.length) {
      return `
        <section class="knowledge-section portrait-atlas-section" id="portraits" data-view="portraits">
          <p class="empty-state" role="alert">画像资料暂时无法载入。</p>
        </section>`;
    }
    const validIds = new Set(records.map(({ portrait }) => portrait.id));
    const selectedId = validIds.has(options.selectedId) ? options.selectedId : records[0].portrait.id;
    const ownId = validIds.has(options.ownId) ? options.ownId : '';
    const selected = records.find(({ portrait }) => portrait.id === selectedId);
    return `
      <section class="knowledge-section portrait-atlas-section" id="portraits" data-view="portraits" aria-labelledby="portrait-atlas-title">
        <header class="portrait-atlas-heading">
          <p class="section-kicker">十五种思考方式</p>
          <h1 id="portrait-atlas-title">思考画像图鉴</h1>
          <p>画像不是给人定型，而是帮助我们比较：面对 AI、证据和现实后果时，人会怎样作出不同的判断。</p>
        </header>
        <div class="portrait-atlas-layout">
          <nav class="portrait-atlas-directory" aria-label="选择一种思考画像">
            ${renderDirectory(records, selectedId, ownId)}
          </nav>
          ${renderDetail(selected, data.theoryUnits || [])}
        </div>
      </section>`;
  }

  return { escapeHtml, renderPortraitAtlas };
});
