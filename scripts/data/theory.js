(function exposeTheory(root, factory) {
  const theoryUnits = factory();
  if (typeof module === 'object' && module.exports) module.exports = theoryUnits;
  if (root) {
    root.AIThinkingData = root.AIThinkingData || {};
    root.AIThinkingData.theoryUnits = theoryUnits;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildTheory() {
  return [
    {
      id: 'practice-source',
      step: '01',
      title: '认识从实践材料开始',
      principle: '实践是认识的来源。人的认识不是凭空产生的，而是在同客观世界的实际接触中形成。',
      caseConnection: '灾情图片提供了强烈的感性材料，但只有追查发布时间、发布者和事件背景，材料才被放回真实实践关系。',
      question: '我现在依据的是可追溯材料，还是只依据“看起来像真的”？',
      misconception: '实践不是简单的“亲眼看见”；调查、检索原始文件和比较多方材料，也是进入实践联系的方式。',
    },
    {
      id: 'practice-test',
      step: '02',
      title: '让结论接受材料检验',
      principle: '实践是检验认识真理性的唯一标准。流畅表达、权威语气与引用格式不能代替客观检验。',
      caseConnection: '在虚构判例案例中，返回法院原始文件可以区分“来源不存在”和“来源存在但不支持结论”。',
      question: '有什么独立材料，能够让这个结论失败或成立？',
      misconception: '核验不是寻找一条赞成自己的链接，而是主动寻找能限制、修正甚至推翻原判断的材料。',
    },
    {
      id: 'concrete-analysis',
      step: '03',
      title: '在具体关系中分析',
      principle: '认识事物要把握矛盾及其具体条件，不能从抽象优点直接跳到具体结论。',
      caseConnection: '“效率高”“规则一致”都有合理面，但刷脸必要性、招聘公平和配送安全取决于目的、制度、替代方案与利益关系。',
      question: 'AI省略了哪些主体、条件、代价和替代方案？',
      misconception: '矛盾分析不是所有观点各打五十大板，而是识别主要矛盾、条件变化和可能的现实解决路径。',
    },
    {
      id: 'active-subject',
      step: '04',
      title: '人仍是判断与行动的主体',
      principle: '人在实践中能动地认识和改造世界。工具能够扩展能力，但不能替实践主体承担社会后果。',
      caseConnection: 'AI可以整理判例、计算路线或执行筛选规则，最终采用、提交和实施这些建议的人仍须说明依据并承担责任。',
      question: '如果判断产生后果，谁能解释目标、修正规则并承担责任？',
      misconception: '强调主体性不是拒绝AI，而是把AI放回“人使用工具解决具体问题”的关系中。',
    },
    {
      id: 'human-development',
      step: '05',
      title: '把技术发展落到人的发展',
      principle: '社会发展最终要体现为人的自由而全面的发展。技术效率必须与人的选择、能力和责任一起考察。',
      caseConnection: '自动化客服、算法管理和学习监控可以提高效率，但还要追问谁承担错误、谁能退出、人的能力是否真正得到发展。',
      question: '这项技术扩展了谁的能力，又把哪些代价转给了谁？',
      misconception: '人本立场不是抽象地拒绝效率，而是让效率服务于人的现实需要，并保留必要的选择和救济通道。',
    },
    {
      id: 'practice-loop',
      step: '06',
      title: '实践、认识、再实践、再认识',
      principle: '认识具有反复性和无限性，会在新的材料、行动和结果中不断深化。',
      caseConnection: '网站允许你在核验证据后坚持或改变观点；关键不是必须改变，而是能否说明新判断如何由新材料产生。',
      question: '新的证据改变了什么？还有哪些未知需要下一轮实践回答？',
      misconception: '修正观点不是“前面答错了”，坚持观点也不等于固执；二者都要接受新的证据和实践结果检验。',
    },
  ];
});
