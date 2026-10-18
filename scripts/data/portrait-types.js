(function exposePortraitTypes(root, factory) {
  const portraitTypes = factory();
  if (typeof module === 'object' && module.exports) module.exports = portraitTypes;
  if (root) {
    root.AIThinkingData = root.AIThinkingData || {};
    root.AIThinkingData.portraitTypes = portraitTypes;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildPortraitTypes() {
  return [
    { id: 'agency', dimensions: ['agency'], title: '自主掌舵者', coreDescription: '你习惯先确认自己要解决的问题，再决定如何借助工具和他人。', strength: '面对权威语气或群体意见时，你较能保留独立判断。', blindSpot: '独立性较强时，也可能低估共同经验和现实条件对认识的支撑。', theoryLinks: ['active-subject'] },
    { id: 'practice', dimensions: ['practice'], title: '证据侦察者', coreDescription: '你对来源、口径和可复查材料比较敏感，不容易被表达的流畅度说服。', strength: '你擅长把“听起来对”转化为“能否被材料支持”。', blindSpot: '不断追加核验也可能拖延行动，需要在可控风险下用小实践获取新材料。', theoryLinks: ['practice-source', 'practice-test'] },
    { id: 'contradiction', dimensions: ['contradiction'], title: '辩证拆解者', coreDescription: '你常会把一个简单结论拆回具体主体、条件、利益和代价中检查。', strength: '你能看到相互冲突的合理面，也会寻找问题的主要卡点。', blindSpot: '条件看得过多时，可能难以确定当下先解决什么。', theoryLinks: ['concrete-analysis'] },
    { id: 'revision', dimensions: ['revision'], title: '开放校准者', coreDescription: '你把结论看作可随材料和行动结果继续修改的暂时判断。', strength: '新证据到来时，你较愿意承认原判断需要改动。', blindSpot: '对变化保持高度开放时，也要防止没有新证据却频繁摇摆。', theoryLinks: ['practice-loop'] },
    { id: 'humanity', dimensions: ['humanity'], title: '责任守望者', coreDescription: '你不只问方案是否高效，还会追问谁受影响、谁承担风险。', strength: '你容易看见数据和指标后面的人，也重视选择权与责任。', blindSpot: '价值关切需要转化为可行的制度和技术条件，否则容易停在愿望层面。', theoryLinks: ['human-development', 'active-subject'] },
    { id: 'agency-practice', dimensions: ['agency', 'practice'], title: '独立求证者', coreDescription: '你不愿把判断交给他人，也不满足于只凭直觉坚持自己。', strength: '你能把自主立场与可核验材料结合，使判断既有主体性又有现实支撑。', blindSpot: '如果只相信自己能验证的部分，可能忽略他人经验和集体实践提供的线索。', theoryLinks: ['active-subject', 'practice-test'] },
    { id: 'agency-contradiction', dimensions: ['agency', 'contradiction'], title: '破局思考者', coreDescription: '你倾向自己定义问题，再从多方关系中找到真正需要改变的部分。', strength: '你既能抵抗现成答案，也能识别问题不是单一原因造成的。', blindSpot: '在强调自主破局时，需要确认自己是否真正掌握了其他主体的处境。', theoryLinks: ['active-subject', 'concrete-analysis'] },
    { id: 'agency-revision', dimensions: ['agency', 'revision'], title: '自我更新者', coreDescription: '你愿意独立形成立场，也愿意在新材料到来时改写它。', strength: '你的坚持通常不等于固执，修正也不等于随波逐流。', blindSpot: '如果没有明确的修正标准，自主选择和频繁调整可能在压力下互相拉扯。', theoryLinks: ['active-subject', 'practice-loop'] },
    { id: 'agency-humanity', dimensions: ['agency', 'humanity'], title: '价值掌舵者', coreDescription: '你希望自己决定技术如何介入生活，也把人的选择和后果视为决策边界。', strength: '你容易发现“为了你好”背后是否剥夺了当事人的选择。', blindSpot: '鲜明的价值立场需要接受具体效果检验，不能只凭动机确认方案正当。', theoryLinks: ['active-subject', 'human-development'] },
    { id: 'practice-contradiction', dimensions: ['practice', 'contradiction'], title: '证据解构者', coreDescription: '你不仅查证据是否可信，还会查它在什么条件下支持哪一部分结论。', strength: '你擅长区分事实、推断和价值前提，避免用一条材料解释全部问题。', blindSpot: '对证据边界和条件差异过度敏感时，可能难以为行动形成足够清晰的暂时结论。', theoryLinks: ['practice-test', 'concrete-analysis'] },
    { id: 'practice-revision', dimensions: ['practice', 'revision'], title: '实证迭代者', coreDescription: '你习惯让结论经过材料和行动反复校准，而不是一次定型。', strength: '你能把核验结果真正写回判断，不会只收集材料却不改变观点。', blindSpot: '持续迭代也需要阶段性停点，否则每次更新都可能重新打开已经足够稳定的问题。', theoryLinks: ['practice-test', 'practice-loop'] },
    { id: 'practice-humanity', dimensions: ['practice', 'humanity'], title: '责任求证者', coreDescription: '你希望关于人的风险不只停留在担忧，而能被数据、记录和当事人经验检验。', strength: '你能把价值问题转成可追问的事实问题，让责任有具体依据。', blindSpot: '不是所有人的尊严和选择都能被量化，有些边界需要在数据之前被承认。', theoryLinks: ['practice-test', 'human-development'] },
    { id: 'contradiction-revision', dimensions: ['contradiction', 'revision'], title: '动态权衡者', coreDescription: '你会随条件变化重新判断主要矛盾，很少把一套答案固定到所有场景。', strength: '你能看到关系在变，也愿意让解决方案跟着现实更新。', blindSpot: '持续权衡可能让你错过需要及时站稳立场的时刻，必须区分可调整条件和不可退让边界。', theoryLinks: ['concrete-analysis', 'practice-loop'] },
    { id: 'contradiction-humanity', dimensions: ['contradiction', 'humanity'], title: '人本协调者', coreDescription: '你会把不同人的处境放进同一个问题中，寻找不把成本单方转嫁的方案。', strength: '你能在效率、权利和现实条件之间发现真正的紧张关系。', blindSpot: '希望兼顾每个人时，也需要承认资源有限，并说清当下的主要目标。', theoryLinks: ['concrete-analysis', 'human-development'] },
    { id: 'revision-humanity', dimensions: ['revision', 'humanity'], title: '开放关怀者', coreDescription: '你会根据真实受影响者的经验修正方案，不把初始善意当成最终答案。', strength: '你能听见方案落地后的新问题，并愿意为人的实际处境调整原计划。', blindSpot: '不断回应不同需求时，要避免方案失去稳定目标和可执行性。', theoryLinks: ['practice-loop', 'human-development'] },
  ];
});
