(function exposePortraitQuestions(root, factory) {
  const portraitQuestions = factory();
  if (typeof module === 'object' && module.exports) module.exports = portraitQuestions;
  if (root) {
    root.AIThinkingData = root.AIThinkingData || {};
    root.AIThinkingData.portraitQuestions = portraitQuestions;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildPortraitQuestions() {
  function question(config) {
    const secondary = config.secondaryDimension;
    return {
      id: config.id,
      phase: config.phase,
      ...(config.order ? { order: config.order } : {}),
      context: config.context,
      prompt: config.prompt,
      dimension: config.dimension,
      ...(secondary ? { secondaryDimension: secondary } : {}),
      ...(config.consistencyKey ? { consistencyKey: config.consistencyKey } : {}),
      options: config.options.map((entry, index) => {
        const weights = { [config.dimension]: entry[1] };
        if (secondary && typeof entry[2] === 'number') weights[secondary] = entry[2];
        return { id: ['a', 'b', 'c'][index], label: entry[0], weights };
      }),
      theoryAnchor: config.theoryAnchor,
      contextTags: config.contextTags,
    };
  }

  return [
    question({
      id: 'b01-ai-outline', phase: 'base', order: 1, dimension: 'agency', secondaryDimension: 'practice', consistencyKey: 'agency-own-judgment',
      context: '老师布置一篇你不熟悉的课程短评，AI 很快给出了完整提纲。',
      prompt: '你会怎么开始？',
      options: [['先借它理清方向，再自己重组', 0, 0], ['直接按提纲扩写，先完成再说', -2, -1], ['先写出自己的问题和判断，再请它反驳', 2, 1]],
      theoryAnchor: 'active-subject', contextTags: ['AI语气', '学习'],
    }),
    question({
      id: 'b02-hot-chart', phase: 'base', order: 2, dimension: 'practice', consistencyKey: 'practice-source-check',
      context: '群里转发一张热搜数据图，结论很惊人，但图上没有来源。',
      prompt: '你最可能做的第一步是？',
      options: [['搜原始发布者和数据口径', 2], ['先看评论区多数人怎么说', -2], ['记住结论，需要用时再查', 0]],
      theoryAnchor: 'practice-source', contextTags: ['热点信息', '证据来源'],
    }),
    question({
      id: 'b03-team-conflict', phase: 'base', order: 3, dimension: 'contradiction', consistencyKey: 'contradiction-many-sides',
      context: '小组作业进度落后，有人认为是组长不会安排，也有人说大家都太忙。',
      prompt: '你会如何处理？',
      options: [['先调整分工，做了再看是什么问题', 0], ['分别查时间、分工和沟通，找主要卡点', 2], ['要求组长承担责任，先统一指挥', -2]],
      theoryAnchor: 'concrete-analysis', contextTags: ['群体意见', '校园协作'],
    }),
    question({
      id: 'b04-teacher-feedback', phase: 'base', order: 4, dimension: 'revision', consistencyKey: 'revision-new-evidence',
      context: '你对一篇作品很满意，老师却指出核心论据支撑不足。',
      prompt: '你会怎么改？',
      options: [['保留核心结论，补几条材料', 0], ['先重查论据，必要时改写结论', 2], ['我有自己的表达，不因一次意见改方向', -2]],
      theoryAnchor: 'practice-loop', contextTags: ['反馈', '学习'],
    }),
    question({
      id: 'b05-library-hours', phase: 'base', order: 5, dimension: 'humanity', consistencyKey: 'humanity-consequences',
      context: '学校考虑用无人值守延长图书馆开放时间，但晚班勤工岗位会减少。',
      prompt: '你最关心方案中的哪一点？',
      options: [['能否给原岗位提供转岗和过渡安排', 2], ['延长开放时间后的使用效率', -2], ['两者都要算，先做小范围试行', 0]],
      theoryAnchor: 'human-development', contextTags: ['效率压力', '人的后果'],
    }),
    question({
      id: 'b06-career-match', phase: 'base', order: 6, dimension: 'agency', secondaryDimension: 'humanity',
      context: '求职平台根据你的浏览记录，判断你最适合一个薪资较高但你不熟悉的方向。',
      prompt: '你会怎么用这个推荐？',
      options: [['把它当成候选，再用自己的目标和经历筛选', 2, 1], ['平台数据更全，优先走它给的路', -2, -1], ['先去体验相关任务，再决定要不要转向', 0, 0]],
      theoryAnchor: 'active-subject', contextTags: ['推荐系统', '求职'],
    }),
    question({
      id: 'b07-product-review', phase: 'base', order: 7, dimension: 'practice', secondaryDimension: 'contradiction',
      context: '你想买耳机，一篇评测对音质赞不绝口，文末标注了购买返佣链接。',
      prompt: '这会如何影响你的判断？',
      options: [['只要参数详细，返佣不影响内容', -2, -1], ['把它当一条材料，再对比独立测试和自己需求', 2, 1], ['会降低信任，但仍可参考具体测量', 0, 0]],
      theoryAnchor: 'practice-test', contextTags: ['消费推荐', '证据来源'],
    }),
    question({
      id: 'b08-history-cause', phase: 'base', order: 8, dimension: 'contradiction',
      context: '准备历史展示时，队友想用一句话将一次事件归因于“某个人的决定”。',
      prompt: '你会怎么补充？',
      options: [['人物故事更好懂，汇报时这样就够了', -2], ['补上制度、利益和时代条件，再说人的作用', 2], ['保留主线，只加一句背景说明', 0]],
      theoryAnchor: 'concrete-analysis', contextTags: ['学习', '单一叙事'],
    }),
    question({
      id: 'b09-rumor-correction', phase: 'base', order: 9, dimension: 'revision',
      context: '你已经把一条“校园新规”发给了朋友，随后看到官方通知与之不符。',
      prompt: '你会怎么做？',
      options: [['说清原消息有误，补发通知并改判断', 2], ['只补发官方通知，让大家自己对比', 0], ['原消息也可能有内部渠道，先不表态', -2]],
      theoryAnchor: 'practice-loop', contextTags: ['热点信息', '新材料'],
    }),
    question({
      id: 'b10-campus-camera', phase: 'base', order: 10, dimension: 'humanity', secondaryDimension: 'contradiction',
      context: '宿舍楼想增加摄像头减少物品丢失，方案没有说明拍摄范围和保存时间。',
      prompt: '你对这个方案的态度是？',
      options: [['安全更重要，先装上再完善细则', -2, -1], ['不直接否定，但要先界定必要范围和权利边界', 2, 1], ['只在公共出入口试行，并定期评估', 0, 0]],
      theoryAnchor: 'human-development', contextTags: ['人的后果', '校园治理'],
    }),
    question({
      id: 'b11-majority-vote', phase: 'base', order: 11, dimension: 'agency',
      context: '小组已有五人支持同一个选题，你觉得另一个方向更有价值。',
      prompt: '你会怎么做？',
      options: [['先顺着多数意见，避免影响协作', -2], ['说清理由并提一个可比较的小方案', 2], ['保留意见，但不再推动改变', 0]],
      theoryAnchor: 'active-subject', contextTags: ['群体意见', '校园协作'],
    }),
    question({
      id: 'b12-ai-citation', phase: 'base', order: 12, dimension: 'practice',
      context: 'AI 给你一条看起来很完整的论文引用，但你在学校数据库里搜不到。',
      prompt: '你会怎么处理这条引用？',
      options: [['删掉并换成自己能读到的原文', 2], ['标题和期刊都像真的，可以先保留', -2], ['不用这条引用，但可保留它提供的检索方向', 0]],
      theoryAnchor: 'practice-test', contextTags: ['AI语气', '证据来源'],
    }),
    question({
      id: 'b13-automation-jobs', phase: 'base', order: 13, dimension: 'contradiction', secondaryDimension: 'humanity',
      context: '一家公司说自动化会提高效率，因此计划立即减少一批岗位。',
      prompt: '你认为讨论还缺什么？',
      options: [['只要生产率提高，岗位变化是必然成本', -2, -1], ['要看哪些任务改变、谁受影响、能否培训转岗', 2, 1], ['先比较减少岗位和不减少的成本', 0, 0]],
      theoryAnchor: 'concrete-analysis', contextTags: ['效率压力', '就业'],
    }),
    question({
      id: 'b14-peer-critique', phase: 'base', order: 14, dimension: 'revision', secondaryDimension: 'agency',
      context: '两位同学对你的演示给出相反建议，一个说理论太多，一个说理论不够。',
      prompt: '你会怎么决定修改方向？',
      options: [['回到作业目标和展示时间，分别验证两条建议', 2, 1], ['采用多数人支持的那一条', 0, -1], ['原结构有自己的逻辑，先不改', -2, 0]],
      theoryAnchor: 'practice-loop', contextTags: ['反馈', '群体意见'],
    }),
    question({
      id: 'b15-delivery-target', phase: 'base', order: 15, dimension: 'humanity',
      context: '配送系统能把平均时间再压缩两分钟，但这会增加骑手超速的可能。',
      prompt: '你会如何设定优化目标？',
      options: [['准时率是用户最直接的需求，优先保证它', -2], ['把安全、等待原因和送达时间一起纳入', 2], ['先在极端天气下放宽时间，再评估', 0]],
      theoryAnchor: 'human-development', contextTags: ['效率压力', '人的后果'],
    }),
    question({
      id: 'b16-ai-disagreement', phase: 'base', order: 16, dimension: 'agency', secondaryDimension: 'revision', consistencyKey: 'agency-own-judgment',
      context: '你已经得出一个初步判断，AI 却用非常确定的语气给出相反答案。',
      prompt: '你会如何继续？',
      options: [['要求它列出依据，与自己的理由逐项对照', 2, 1], ['它接触的资料更多，先采用它的结论', -2, -1], ['保留自己的判断，等有新材料再说', 0, 0]],
      theoryAnchor: 'active-subject', contextTags: ['AI语气', '新材料'],
    }),
    question({
      id: 'b17-news-video', phase: 'base', order: 17, dimension: 'practice', consistencyKey: 'practice-source-check',
      context: '一段短视频声称拍到了某公共事件现场，画面真实，账号却没有说时间和地点。',
      prompt: '你会怎么判断？',
      options: [['画面细节连贯，可以先当作现场材料', -2], ['先保留，看是否有其他账号证实', 0], ['查首发、时间地点和可独立对照的细节', 2]],
      theoryAnchor: 'practice-source', contextTags: ['热点信息', '证据来源'],
    }),
    question({
      id: 'b18-club-budget', phase: 'base', order: 18, dimension: 'contradiction', secondaryDimension: 'humanity', consistencyKey: 'contradiction-many-sides',
      context: '社团经费只够支持一项活动：一项参与人多，另一项能帮助一小群有特殊需求的同学。',
      prompt: '你会如何推动决策？',
      options: [['不只比人数，还比较需求紧迫性和替代方案', 2, 1], ['按参与人数投票，这样最公平', -2, -1], ['两项都缩小规模，先避免取舍', 0, 0]],
      theoryAnchor: 'concrete-analysis', contextTags: ['群体意见', '人的后果'],
    }),
    question({
      id: 'b19-source-overturns', phase: 'base', order: 19, dimension: 'revision', consistencyKey: 'revision-new-evidence',
      context: '你的汇报已经做完，新找到的原始文件却与核心论点冲突。',
      prompt: '距离展示只剩一晚，你会？',
      options: [['重写核心结论，并说明新材料改变了什么', 2], ['在限制部分提到这份文件，主线不变', 0], ['时间太紧，等展示后再处理', -2]],
      theoryAnchor: 'practice-loop', contextTags: ['新材料', '时间压力'],
    }),
    question({
      id: 'b20-face-checkin', phase: 'base', order: 20, dimension: 'humanity', consistencyKey: 'humanity-consequences',
      context: '班级想用人脸签到减少代签，但不参与的同学只能每次单独说明。',
      prompt: '你认为什么最值得先讨论？',
      options: [['先看识别准确率，只要准就可以推行', -2], ['方案是否真有必要，且有无平等便利的替代方式', 2], ['可以先试一个月，同时收集异议', 0]],
      theoryAnchor: 'human-development', contextTags: ['人的后果', '校园治理'],
    }),
    question({
      id: 'b21-shopping-feed', phase: 'base', order: 21, dimension: 'agency', secondaryDimension: 'contradiction',
      context: '购物平台连续推荐同一风格的商品，你发现自己每次都从它给的选项里挑。',
      prompt: '下次购买前，你会怎么做？',
      options: [['推荐已经很合口味，从里面选效率最高', -2, -1], ['先写清实际需求和预算，再主动搜其他选项', 2, 1], ['继续看推荐，但给自己留一天冷静期', 0, 0]],
      theoryAnchor: 'active-subject', contextTags: ['推荐系统', '消费推荐'],
    }),
    question({
      id: 'b22-campus-notice', phase: 'base', order: 22, dimension: 'practice', secondaryDimension: 'revision',
      context: '同学说下周的课取消了，还发来一张聊天截图，但课程群没有通知。',
      prompt: '你会怎么安排？',
      options: [['截图信息具体，按取消安排其他事', -2, -1], ['暂时保留时间，向任课老师或正式渠道确认', 2, 1], ['问几个同学，大家都听说就相信', 0, 0]],
      theoryAnchor: 'practice-source', contextTags: ['证据来源', '群体意见'],
    }),
    question({
      id: 'b23-family-ai-care', phase: 'base', order: 23, dimension: 'contradiction', secondaryDimension: 'humanity',
      context: '家里想给老人用 AI 健康助手，它能提醒用药，但老人不习惯操作手机。',
      prompt: '你会如何评估它是否有用？',
      options: [['只要功能完善，多教几次就能适应', -2, -1], ['同时看提醒准确性、操作门槛和家人支持条件', 2, 1], ['先只开启一项功能，观察是否真能融入生活', 0, 0]],
      theoryAnchor: 'concrete-analysis', contextTags: ['人的后果', '技术条件'],
    }),
    question({
      id: 'b24-meeting-plan', phase: 'base', order: 24, dimension: 'revision', secondaryDimension: 'contradiction',
      context: '班会方案已经通过，执行前才发现场地容量只有预计的一半。',
      prompt: '你会如何反应？',
      options: [['重新排目标和环节，接受原方案需要变化', 2, 1], ['保留主要环节，现场根据人数灵活处理', 0, 0], ['方案已通过，优先想办法找更大场地', -2, -1]],
      theoryAnchor: 'practice-loop', contextTags: ['新材料', '校园协作'],
    }),
    question({
      id: 'b25-study-monitor', phase: 'base', order: 25, dimension: 'humanity', secondaryDimension: 'agency',
      context: '一款学习软件可以强制锁定其他应用，并把专注时长发给老师或家长。',
      prompt: '你怎么看这种功能？',
      options: [['可以作为自选工具，但不应默认上传个人记录', 2, 1], ['只要能提高专注度，强制也有必要', -2, -1], ['可在考试周自愿开启，到期自动关闭', 0, 0]],
      theoryAnchor: 'human-development', contextTags: ['人的后果', '学习'],
    }),

    question({
      id: 'c01-agency-authority', phase: 'calibration', dimension: 'agency', secondaryDimension: 'practice',
      context: '你对一个热点已有初步看法，但还没核对原始材料。', prompt: '你会先做哪一步？',
      options: [['先说清自己的判断，暂不追加材料', 2, -1], ['先不表态，找到原始材料再说', -2, 1], ['写下初步判断，再找一条材料对照', 0, 0]], theoryAnchor: 'active-subject', contextTags: ['热点信息', '证据来源'],
    }),
    question({
      id: 'c02-agency-template', phase: 'calibration', dimension: 'agency', secondaryDimension: 'contradiction',
      context: '小组对同一问题有三种解释，你已经形成了自己的方案。', prompt: '你会怎么推进？',
      options: [['先用自己的方案推进，遇到问题再调整', 2, -1], ['先拆开三种解释的条件，暂不确定主导方案', -2, 1], ['保留自己的方案，同时请每个人说明一个关键条件', 0, 0]], theoryAnchor: 'concrete-analysis', contextTags: ['群体意见', '校园协作'],
    }),
    question({
      id: 'c03-practice-screenshot', phase: 'calibration', dimension: 'agency', secondaryDimension: 'revision',
      context: '你的学习方案刚执行两天，就收到了一条与预期不符的反馈。', prompt: '你会如何处理？',
      options: [['先保持自己的方案，等一个完整周期再说', 2, -1], ['暂停现有方案，根据反馈重新调整', -2, 1], ['保留目标，只改动与这条反馈相关的步骤', 0, 0]], theoryAnchor: 'practice-loop', contextTags: ['反馈', '学习'],
    }),
    question({
      id: 'c04-practice-demo', phase: 'calibration', dimension: 'agency', secondaryDimension: 'humanity',
      context: '你想在小组作业中使用 AI 自动分配任务，但组员对是否采用有分歧。', prompt: '你更倾向哪种决定方式？',
      options: [['由我选定工具先试行，效率更重要', 2, -1], ['先让受分工影响的每个人决定是否使用', -2, 1], ['我提出限时试行，任何人都可要求退出', 0, 0]], theoryAnchor: 'human-development', contextTags: ['校园协作', '人的后果'],
    }),
    question({
      id: 'c05-contradiction-ban', phase: 'calibration', dimension: 'practice', secondaryDimension: 'contradiction',
      context: '一款新工具在宣传中能明显提高学习效率，但不同课程的任务差别很大。', prompt: '你会怎么评估？',
      options: [['先用一次真实任务比较时间和质量', 2, -1], ['先分析它在不同任务中的条件差别，暂不试用', -2, 1], ['选一类任务试用，同时记录哪些条件影响效果', 0, 0]], theoryAnchor: 'practice-test', contextTags: ['小规模实践', '技术条件'],
    }),
    question({
      id: 'c06-contradiction-comments', phase: 'calibration', dimension: 'practice', secondaryDimension: 'revision',
      context: '一项你支持的方案出现了负面反馈，但现有样本还很小。', prompt: '你会先做什么？',
      options: [['保留原判断，再设计一次可比较的验证', 2, -1], ['先根据已有反馈调整判断，之后再补材料', -2, 1], ['小幅调整方案，同时扩大观察样本', 0, 0]], theoryAnchor: 'practice-loop', contextTags: ['反馈', '小规模实践'],
    }),
    question({
      id: 'c07-revision-debate', phase: 'calibration', dimension: 'practice', secondaryDimension: 'humanity',
      context: '一套自动评价规则在测试中准确率很高，但少数同学认为它让自己无法解释特殊情况。', prompt: '你会优先看什么？',
      options: [['先用更多样本检验准确率是否稳定', 2, -1], ['先让受影响同学说明申诉和退出需求', -2, 1], ['继续测试，同时加入人工申诉通道', 0, 0]], theoryAnchor: 'human-development', contextTags: ['人的后果', '证据来源'],
    }),
    question({
      id: 'c08-revision-update', phase: 'calibration', dimension: 'contradiction', secondaryDimension: 'revision',
      context: '一个班会方案遭到两类完全不同的批评，但活动明天就要开始。', prompt: '你会如何处理？',
      options: [['先理清两类批评的条件和主要冲突，暂不改方案', 2, -1], ['根据最新问题立即重排方案', -2, 1], ['找出影响最大的一项批评，只改相关环节', 0, 0]], theoryAnchor: 'concrete-analysis', contextTags: ['校园协作', '新材料'],
    }),
    question({
      id: 'c09-humanity-ranking', phase: 'calibration', dimension: 'contradiction', secondaryDimension: 'humanity',
      context: '系统要按“活跃度”排名学生，效率目标、教学管理和个人压力同时存在。', prompt: '你会先处理哪一层？',
      options: [['先分析指标、用途和不同人的利益关系', 2, -1], ['先停止公开排名，保护受影响最大的人', -2, 1], ['只向本人展示结果，再评估指标是否合理', 0, 0]], theoryAnchor: 'human-development', contextTags: ['校园治理', '人的后果'],
    }),
    question({
      id: 'c10-humanity-helpdesk', phase: 'calibration', dimension: 'revision', secondaryDimension: 'humanity',
      context: '一项自动化方案上线后确实提速，但当事人反映选择权变少了。', prompt: '你会怎么调整？',
      options: [['根据最新反馈立即换一套流程', 2, -1], ['先恢复当事人的选择和人工通道，再讨论效率', -2, 1], ['保留自动流程，增加随时转人工的选项', 0, 0]], theoryAnchor: 'human-development', contextTags: ['效率压力', '人的后果'],
    }),
  ];
});
