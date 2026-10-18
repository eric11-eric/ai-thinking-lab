(function exposeVisualizationRenderer(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingVisualizationUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createVisualizationRenderer() {
  function renderVisualizations() {
    return `
      <section class="knowledge-section visualization-section" data-view="theory" aria-labelledby="visualization-title">
        <header>
          <h2 id="visualization-title">四幅图，看见判断怎样形成</h2>
          <p>前两幅解释认识过程，后两幅练习读懂来源数据和口径。</p>
        </header>
        <div class="figure-grid">
          <figure class="explain-figure pathway-figure">
            <figcaption><strong>AI回答如何进入人的判断</strong><span>原创解释图</span></figcaption>
            <div class="pathway" aria-label="材料经过AI选择和组织，进入人的判断，再由实践结果反馈">
              <div><span>材料</span><small>事实与缺口</small></div>
              <i aria-hidden="true">→</i>
              <div><span>AI组织</span><small>选择与推断</small></div>
              <i aria-hidden="true">→</i>
              <div><span>人的判断</span><small>目标与责任</small></div>
              <i aria-hidden="true">→</i>
              <div><span>实践结果</span><small>检验与修正</small></div>
            </div>
            <p class="figure-boundary"><strong>图意：</strong>AI不是材料与结论之间的透明管道。人的目标、核验和行动始终在链条中。</p>
          </figure>

          <figure class="explain-figure loop-figure">
            <figcaption><strong>实践与认识的循环</strong><span>原创解释图</span></figcaption>
            <ol class="practice-loop" aria-label="实践、认识、再实践、再认识的循环">
              <li><strong>接触材料</strong><span>实践</span></li>
              <li><strong>形成解释</strong><span>认识</span></li>
              <li><strong>核验行动</strong><span>再实践</span></li>
              <li><strong>修正边界</strong><span>再认识</span></li>
            </ol>
            <p class="figure-boundary"><strong>图意：</strong>改变不是终点，坚持也不是终点。新的实践还会产生新的材料与问题。</p>
          </figure>

          <figure class="data-figure actions-figure">
            <figcaption><strong>生活服务平台公开整改进展</strong><span>单位：项，时间：截至2026年5月8日</span></figcaption>
            <div class="column-chart" role="img" aria-label="已实施优化改进63项，承诺遵守算法要求139项，限期推进125项">
              <div style="--column-value: 45%"><strong>63</strong><span>已实施改进</span></div>
              <div style="--column-value: 100%"><strong>139</strong><span>公开承诺</span></div>
              <div style="--column-value: 90%"><strong>125</strong><span>限期推进</span></div>
            </div>
            <p class="figure-source">来源索引：<code>cac-platform-progress-2026</code></p>
            <p class="figure-boundary"><strong>结论边界：</strong>三类事项可能处于不同阶段，不能相加成“327项已完成”，也不能直接证明长期效果。</p>
            <details class="data-table"><summary>查看数据表</summary><table><thead><tr><th>口径</th><th>数量</th><th>单位</th></tr></thead><tbody><tr><td>已实施优化改进</td><td>63</td><td>项</td></tr><tr><td>承诺遵守算法要求</td><td>139</td><td>项</td></tr><tr><td>限期推进</td><td>125</td><td>项</td></tr></tbody></table></details>
          </figure>

          <figure class="data-figure units-figure">
            <figcaption><strong>无AI标识虚假信息治理规模</strong><span>两种口径，时间：2026年2月12日通报</span></figcaption>
            <div class="unit-panels">
              <div><strong>13,421</strong><span>处置账号，单位：个</span></div>
              <div><strong>543,000+</strong><span>清理信息，单位：条</span></div>
            </div>
            <p class="figure-source">来源索引：<code>cac-unlabeled-ai-2026</code></p>
            <p class="figure-boundary"><strong>结论边界：</strong>账号数与信息数不是同一单位，不能比较高低或直接计算为社会误导率。</p>
            <details class="data-table"><summary>查看数据表</summary><table><thead><tr><th>指标</th><th>数量</th><th>单位</th></tr></thead><tbody><tr><td>依法依约处置账号</td><td>13,421</td><td>个</td></tr><tr><td>清理违法违规信息</td><td>543,000+</td><td>条</td></tr></tbody></table></details>
          </figure>
        </div>
      </section>`;
  }

  return { renderVisualizations };
});
