(function exposeToolkitRenderer(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingToolkitUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createToolkitRenderer() {
  const groups = [
    {
      title: '来源追踪',
      question: '这条材料从哪里来？',
      checks: ['找到首次发布者与原始时间', '区分原文、转述和二次截图', '确认引用真的支持当前说法'],
    },
    {
      title: '数据口径',
      question: '数字之间真的能比较吗？',
      checks: ['核对单位、时间范围和样本', '区分数量、比例与变化率', '记录未公开或无法确认的数据'],
    },
    {
      title: '因果推断',
      question: '相关关系能证明原因吗？',
      checks: ['寻找可能同时变化的第三因素', '检查时间顺序与反事实', '避免从一个案例推出普遍规律'],
    },
    {
      title: '多方立场',
      question: '谁设定目标，谁承担后果？',
      checks: ['列出受到影响的不同主体', '找出没有进入模型的成本', '检查是否存在替代规则或申诉机制'],
    },
  ];

  function renderToolkit() {
    const content = groups.map((group, groupIndex) => `
      <fieldset class="toolkit-group">
        <legend>${group.title}</legend>
        <p>${group.question}</p>
        ${group.checks.map((item, index) => `
          <label>
            <input type="checkbox" data-toolkit-check="${groupIndex}-${index}">
            <span>${item}</span>
          </label>`).join('')}
      </fieldset>`).join('');
    return `
      <section class="knowledge-section toolkit-section" id="toolkit" data-view="toolkit" aria-labelledby="toolkit-title">
        <header>
          <h2 id="toolkit-title">把核验变成可执行动作</h2>
          <p>选中不是答题得分，而是提醒自己下一步要做什么。</p>
        </header>
        <div class="toolkit-status" role="status"><strong data-toolkit-count>0</strong><span>/ 12 项已检查</span></div>
        <div class="toolkit-grid">${content}</div>
      </section>`;
  }

  return { renderToolkit };
});
