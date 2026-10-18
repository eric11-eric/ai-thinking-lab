(function exposePortraitReportRenderer(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingPortraitReportUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPortraitReportRenderer() {
  const DIMENSIONS = [
    ['agency', '主体性', '借助工具', '自主掌舵'],
    ['practice', '实践核验', '相信表达', '回到证据'],
    ['contradiction', '矛盾意识', '单线判断', '具体分析'],
    ['revision', '修正开放', '维持原判', '随证更新'],
    ['humanity', '人本责任', '效率优先', '人的发展'],
  ];

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function finite(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, finite(value, minimum)));
  }

  function renderPortraitSvg(portrait, idSuffix = 'main') {
    const params = portrait && portrait.portraitParams ? portrait.portraitParams : {};
    const radius = clamp(params.shapeRadius, 34, 66);
    const rotation = clamp(params.rotation, -18, 18);
    const gap = clamp(params.layerGap, 5, 22);
    const colorRatio = clamp(params.colorRatio, 0, 1);
    const openness = clamp(params.contourOpenness, 0, 1);
    const arcEnd = 155 + Math.round(openness * 95);
    const accentX = 48 + Math.round(colorRatio * 94);
    const title = portrait && portrait.type ? portrait.type.title : '思考画像';
    return `
      <svg class="portrait-visual" viewBox="0 0 240 240" role="img" aria-labelledby="portrait-svg-title-${escapeHtml(idSuffix)} portrait-svg-desc-${escapeHtml(idSuffix)}">
        <title id="portrait-svg-title-${escapeHtml(idSuffix)}">${escapeHtml(title)}的抽象思考画像</title>
        <desc id="portrait-svg-desc-${escapeHtml(idSuffix)}">由主体性、实践核验、矛盾意识、修正开放和人本责任五维选择生成的抽象图形。</desc>
        <rect width="240" height="240" rx="28" class="portrait-svg-paper"></rect>
        <g transform="rotate(${rotation} 120 120)">
          <circle cx="120" cy="120" r="${radius}" class="portrait-svg-core"></circle>
          <circle cx="120" cy="120" r="${radius + gap}" class="portrait-svg-orbit"></circle>
          <path d="M 48 150 C 72 ${arcEnd}, 156 ${arcEnd - 82}, 194 83" class="portrait-svg-line"></path>
          <rect x="${accentX}" y="47" width="34" height="92" rx="17" class="portrait-svg-accent"></rect>
          <circle cx="${188 - Math.round(openness * 22)}" cy="${166 - Math.round(colorRatio * 28)}" r="12" class="portrait-svg-dot"></circle>
        </g>
      </svg>`;
  }

  function renderSpectra(scores = {}) {
    return DIMENSIONS.map(([id, label, low, high]) => {
      const value = Math.round(clamp(scores[id], 0, 100));
      return `
        <div class="portrait-spectrum" data-dimension="${id}">
          <div class="spectrum-heading"><strong>${label}</strong><span>${value}%</span></div>
          <div class="spectrum-track" role="img" aria-label="${label}在本次选择光谱中的位置为 ${value}%">
            <span style="width: ${value}%"></span>
          </div>
          <div class="spectrum-poles"><span>${low}</span><span>${high}</span></div>
        </div>`;
    }).join('');
  }

  function renderMoments(moments = []) {
    if (!moments.length) return '<p class="empty-note">还没有足够的回答生成关键时刻。</p>';
    return moments.map((moment, index) => `
      <article class="portrait-moment" data-evidence-id="${escapeHtml(moment.questionId)}">
        <span class="moment-number">0${index + 1}</span>
        <p class="moment-context">${escapeHtml(moment.context)}</p>
        <h3>${escapeHtml(moment.choice)}</h3>
        <p>${escapeHtml(moment.explanation)}</p>
      </article>`).join('');
  }

  function renderContexts(features = []) {
    if (!features.length) return '<p class="empty-note">你的情境差异还不明显，画像主要来自五维选择。</p>';
    return features.map((feature) => `
      <article class="context-card">
        <span>${escapeHtml(feature.tag)}</span>
        <p>${escapeHtml(feature.text)}</p>
      </article>`).join('');
  }

  function renderMarxWakeup(guidance = {}) {
    const evidence = guidance.evidence;
    return `
      <section class="marx-wakeup guidance-impact" id="marx-guidance" tabindex="-1" aria-labelledby="marx-guidance-title">
        <p class="section-kicker">${escapeHtml(guidance.label || '马原提醒你')}</p>
        <div class="guidance-anchor">
          <span>先把原理摆在这里</span>
          <strong>${escapeHtml(guidance.anchor || '实践、认识、再实践、再认识。')}</strong>
        </div>
        <h2 id="marx-guidance-title">${escapeHtml(guidance.punchline || '画像要回到实践中继续生长。')}</h2>
        ${evidence ? `
          <p class="marx-wakeup-evidence" data-evidence-id="${escapeHtml(evidence.questionId)}">
            <strong>你的选择：</strong>${escapeHtml(evidence.choice)}。 ${escapeHtml(evidence.rationale)}
          </p>` : ''}
        <p class="marx-wakeup-explanation">${escapeHtml(guidance.explanation || '这次结果只是下一轮实践的起点。')}</p>
        <div class="guidance-exercise">
          <span>回到实践</span>
          <p>${escapeHtml(guidance.exercise || '完成一次真实行动后，再回来看这张画像。')}</p>
          <small>${escapeHtml(guidance.followUp || '不要把本次结果当成固定身份。')}</small>
        </div>
      </section>`;
  }

  function renderDeepPortraitAnalysis(analysis = {}, theoryConnections = [], evidence) {
    const lenses = [
      ['先说人话', analysis.plainReading],
      ['它在什么条件下成立', analysis.conditions],
      ['你的主要矛盾', analysis.mainContradiction],
      ['从实践看', analysis.practiceAnalysis],
      ['从人的主体性看', analysis.subjectAnalysis],
      ['从人的发展看', analysis.developmentAnalysis],
      ['最容易误解的地方', analysis.misunderstanding],
    ].filter(([, value]) => value);
    return `
      <details class="portrait-deep-analysis">
        <summary>
          <span>用马原深看我的画像</span>
          <small>从实践、矛盾、主体性和人的发展展开</small>
        </summary>
        <div class="portrait-deep-analysis-body">
          ${lenses.map(([label, value]) => `
            <section class="portrait-analysis-lens">
              <h3>${escapeHtml(label)}</h3>
              <p>${escapeHtml(value)}</p>
            </section>`).join('')}
          ${evidence ? `
            <p class="portrait-analysis-answer" data-evidence-id="${escapeHtml(evidence.questionId)}">
              <strong>联系你的回答：</strong>${escapeHtml(evidence.choice)}。${escapeHtml(evidence.rationale || '')}
            </p>` : ''}
          ${theoryConnections.length ? `
            <section class="portrait-analysis-principles" aria-label="对应的马原原理">
              <h3>对应的马原原理</h3>
              ${theoryConnections.map((unit) => `
                <article data-theory-id="${escapeHtml(unit.id)}">
                  <h4>${escapeHtml(unit.title)}</h4>
                  <p>${escapeHtml(unit.principle)}</p>
                </article>`).join('')}
            </section>` : ''}
          <section class="portrait-analysis-practice">
            <h3>把原理变成一次行动</h3>
            <p>${escapeHtml(analysis.practiceExercise || '选一个真实决定，写下判断依据、可能的反证和行动后的复查时间。')}</p>
          </section>
        </div>
      </details>`;
  }

  function renderPortraitEvidence(portrait = {}) {
    return `
      <details class="portrait-analysis-evidence">
        <summary>
          <span>展开查看这张画像的依据</span>
          <small>五维光谱、关键选择与计算方法</small>
        </summary>
        <div class="portrait-analysis-evidence-body">
          <section class="portrait-section" aria-labelledby="spectrum-title">
            <div class="section-heading"><p class="section-kicker">五维光谱</p><h2 id="spectrum-title">你不是一个标签。</h2></div>
            <div class="spectrum-list">${renderSpectra(portrait.scores)}</div>
          </section>

          <section class="portrait-section" aria-labelledby="moment-title">
            <div class="section-heading"><p class="section-kicker">画像证据</p><h2 id="moment-title">三个让你和别人不一样的选择</h2></div>
            <div class="moment-grid">${renderMoments(portrait.moments)}</div>
          </section>

          <section class="portrait-section context-section" aria-labelledby="context-title">
            <div class="section-heading"><p class="section-kicker">情境差异</p><h2 id="context-title">换一种压力，你的判断也会变化。</h2></div>
            <div class="context-grid">${renderContexts(portrait.contextFeatures)}</div>
          </section>

          ${renderEvidenceDrawer(portrait)}
        </div>
      </details>`;
  }

  function renderEvidenceDrawer(portrait) {
    const evidence = Array.isArray(portrait && portrait.answerEvidence) ? portrait.answerEvidence : [];
    const directionLabel = { high: '光谱右侧', low: '光谱左侧', middle: '光谱中部' };
    return `
      <details class="portrait-explainability">
        <summary>这张画像是怎么生成的？</summary>
        <p>五条光谱来自你在具体情境中的选项权重，不使用账号资料，也不调用在线 AI。画像名称由最高的一个或两个维度按固定规则匹配。</p>
        <div class="portrait-evidence-list">${evidence.map((item) => `
          <article class="portrait-evidence-row" data-evidence-id="${escapeHtml(item.questionId)}">
            <span>${escapeHtml(item.questionId)}</span>
            <h3>${escapeHtml(item.context)} ${escapeHtml(item.prompt)}</h3>
            <p><strong>你的选择：</strong>${escapeHtml(item.choice)}</p>
            <div>${(item.weights || []).map((entry) => `<small>${escapeHtml(entry.label)}：${directionLabel[entry.direction] || '光谱中部'}（${entry.weight > 0 ? '+' : ''}${escapeHtml(entry.weight)}）</small>`).join('')}</div>
          </article>`).join('')}</div>
      </details>`;
  }

  function renderPortraitReport(portrait = {}, guidance = {}, analysis = {}) {
    const type = portrait.type || {};
    const title = type.title || '情境思考者';
    return `
      <section class="portrait-reveal" id="report" tabindex="-1" aria-labelledby="portrait-result-title">
        <header class="portrait-result-heading">
          <p class="hero-kicker">你的 AI 时代思考画像</p>
          <p class="portrait-eyebrow">不是定型，而是这一次选择留下的轮廓</p>
          <h1 id="portrait-result-title">${escapeHtml(title)}</h1>
          <p class="portrait-summary">${escapeHtml(portrait.summary || type.coreDescription || '你的选择正在形成一张可以被后续实践修改的画像。')}</p>
          <a class="portrait-theory-jump" href="#marx-guidance">先看马克思怎么说</a>
        </header>

        <div class="portrait-hero-grid">
          <div class="portrait-visual-wrap">${renderPortraitSvg(portrait, 'hero')}</div>
          <article class="portrait-card" aria-label="可打印思考画像卡">
            <span>THINKING PORTRAIT</span>
            <div class="portrait-card-visual">${renderPortraitSvg(portrait, 'card')}</div>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(type.coreDescription || '这是一张来自本次回答的情境化画像。')}</p>
            <p class="portrait-card-summary">${escapeHtml(portrait.summary || '')}</p>
            <div class="portrait-card-context">${(portrait.contextFeatures || []).map((feature) => `<span>${escapeHtml(feature.tag)}</span>`).join('')}</div>
            <div class="portrait-card-spectra">${renderSpectra(portrait.scores)}</div>
            <dl>
              <div><dt>你的优势</dt><dd>${escapeHtml(type.strength || '愿意为自己的判断留下位置。')}</dd></div>
              <div><dt>容易忽略</dt><dd>${escapeHtml(type.blindSpot || '画像仍需要回到行动中接受检验。')}</dd></div>
            </dl>
          </article>
        </div>

        ${renderMarxWakeup(guidance)}
        ${renderDeepPortraitAnalysis(analysis, portrait.theoryConnections || [], guidance.evidence)}
        ${renderPortraitEvidence(portrait)}

        <div class="portrait-result-actions">
          <button class="primary-action" type="button" data-action="print-report">打印画像卡</button>
          <button class="secondary-action" type="button" data-action="portrait-edit-last">修改最后一题</button>
          <button class="text-action" type="button" data-action="reset">重新测试</button>
          <a class="text-link" href="#portraits">去画像图鉴对照</a>
          <a class="text-link" href="#library">继续看真实案例</a>
        </div>
      </section>`;
  }

  return { escapeHtml, renderPortraitReport, renderPortraitSvg };
});
