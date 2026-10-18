(function exposeGuidance(root, factory) {
  const guidanceUnits = factory();
  if (typeof module === 'object' && module.exports) module.exports = guidanceUnits;
  if (root) {
    root.AIThinkingData = root.AIThinkingData || {};
    root.AIThinkingData.guidanceUnits = guidanceUnits;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildGuidance() {
  return [
    {
      dimension: 'agency', label: '主体性', defaultStrength: '你懂得借助工具，也能为自己的决定留下位置。',
      low: { punchline: '别让答案跑在判断前面。', anchor: '人是实践和认识的主体。', explanation: '技术和他人的意见可以扩展认识，但问题的目的、取舍和后果仍需要由行动者负责。', exercise: '下次打开 AI 前，先用两句话写下你的初步判断和不愿交出的责任。', followUp: '用它来检查答案，不是让答案替你决定问题。' },
      high: { punchline: '独立判断，也要让现实进来。', anchor: '人的认识产生于社会实践。', explanation: '主体能动性不是孤立的个人意志。他人经验、共同知识和客观条件都会限定并支撑判断。', exercise: '为你最确定的一个观点找一位有不同经验的人，记下一条你原先没看到的条件。', followUp: '保留主导权，但不把个人确信当成客观性本身。' },
    },
    {
      dimension: 'practice', label: '实践核验', defaultStrength: '你愿意让说法回到材料、行动和结果中接受检验。',
      low: { punchline: '别把流畅，误当成真实。', anchor: '实践是检验真理的唯一标准。', explanation: '来源格式、专业语气和多数人转发都不能代替客观检验。结论必须能回到原始材料或具体实践。', exercise: '为下一个重要结论找到一份原始文件，或设计一次能让它失败的小测试。', followUp: '记下检验后改变的是结论、范围，还是信心程度。' },
      high: { punchline: '证据不是等待行动的借口。', anchor: '实践既检验认识，也产生新认识。', explanation: '材料永远不可能无限完备。在风险可控时，小规模行动本身就是获取新证据的方式。', exercise: '为一个尚未完全确定的判断设定一个低成本试行，同时写明停止条件。', followUp: '不用“还要更多证据”掩盖对行动的逃避。' },
    },
    {
      dimension: 'contradiction', label: '矛盾意识', defaultStrength: '你能看见问题中同时存在的主体、条件和利益关系。',
      low: { punchline: '一句话能下结论，却装不下现实。', anchor: '具体问题要具体分析。', explanation: '事物的矛盾具有特殊性。“效率更高”“多数人支持”只提供一个方面，不能直接推出对具体场景的全部结论。', exercise: '下次决策前写下三项：当下条件、主要矛盾、被省略的一方。', followUp: '如果条件变了，重新问主要矛盾是否也变了。' },
      high: { punchline: '看见所有方面后，还要决定先做什么。', anchor: '处理复杂问题要抓住主要矛盾。', explanation: '辩证分析不是把每个方面并列后停止行动，而是在具体条件下判断什么对当前发展起主导作用。', exercise: '把你列出的因素排成“现在必须处理”“可随行动调整”两类，当天执行第一类的一步。', followUp: '结论可以是暂时的，但行动顺序必须清楚。' },
    },
    {
      dimension: 'revision', label: '修正开放', defaultStrength: '你知道判断不是一次完成的，新材料和行动结果都可以改变它。',
      low: { punchline: '第一次答得出，不等于问题已经结束。', anchor: '认识要在实践中不断发展。', explanation: '认识经过实践、认识、再实践而深化。修正不是承认自己没有判断力，而是让判断对新材料负责。', exercise: '主动找一条可能推翻你当前观点的材料，再写一句“如果它成立，我要改哪部分”。', followUp: '保留修正前后的版本，看变化是否真由新材料引起。' },
      high: { punchline: '开放不是为变而变。', anchor: '真理具有客观性。', explanation: '愿意修正是认识发展的条件，但修正必须由更好的材料、条件变化或实践结果推动，不能只因为最新声音更大。', exercise: '为一个待修正判断预先写下三个改变条件，条件没有发生就不重开结论。', followUp: '比较修正前后的证据强度，不只比较新鲜感。' },
    },
    {
      dimension: 'humanity', label: '人本责任', defaultStrength: '你会追问技术和规则最终改变了谁的生活、选择和责任。',
      low: { punchline: '效率有了答案，人的问题才刚开始。', anchor: '发展最终要落实到人的发展。', explanation: '技术和生产力的发展不能只用速度和产出评价。还要看它是否扩展人的能力、保留选择，以及谁在承担代价。', exercise: '每次采用自动化方案前，先写下三个答案：谁受影响，谁承担后果，当事人能否拒绝。', followUp: '将其中一个答案转化为方案的具体边界。' },
      high: { punchline: '关心人，也要找到改变现实的路。', anchor: '人的活动总是在具体客观条件中进行。', explanation: '人本立场不是抽象地反对一切代价。它需要识别资源、制度和技术条件，把应然目标转化为可执行的步骤。', exercise: '选一个你担心的影响，设计一个一周内能实施的保护措施，并定一个可观察结果。', followUp: '如果措施不奏效，根据反馈改方法，不放弃目标。' },
    },
  ];
});
