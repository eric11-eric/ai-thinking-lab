(function exposeReportEngine(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingReport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createReportEngine() {
  function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function choiceLabel(caseData, choice) {
    const options = Array.isArray(caseData && caseData.options) ? caseData.options : [];
    const match = options.find((option) => option.id === choice);
    return match ? match.label : choice;
  }

  function reactionLabel(reaction) {
    return {
      accept: '接受AI判断',
      question: '提出质疑',
      hold: '保留意见',
    }[reaction] || reaction;
  }

  function positionLabel(choice) {
    return {
      can: '可以',
      cannot: '不能',
      uncertain: '暂时不能确定',
      depends: '取决于任务、证据和责任',
    }[choice] || choice;
  }

  function localDateStamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  function dominantReaction(counts) {
    const order = ['question', 'hold', 'accept'];
    const total = order.reduce((sum, id) => sum + counts[id], 0);
    if (!total) return null;
    const highest = Math.max(...order.map((id) => counts[id]));
    const leaders = order.filter((id) => counts[id] === highest);
    return leaders.length === 1 ? leaders[0] : 'mixed';
  }

  function buildLead(overallPosition, changedCount, persistedCount, aiInfluence) {
    if (overallPosition.initialChoice && overallPosition.finalChoice
      && overallPosition.initialChoice !== overallPosition.finalChoice) {
      return {
        id: 'reconsidered',
        headline: '你没有把第一次回答当成终点。',
        summary: '完成核验后，你对主题问题的回答发生了变化。',
      };
    }
    if (persistedCount) {
      return {
        id: 'reasoned-persistence',
        headline: '你没有为了变化而变化。',
        summary: `查看材料后，你在 ${persistedCount} 个案例中保留了原判断，并留下了依据。`,
      };
    }
    if (changedCount) {
      return {
        id: 'case-revision',
        headline: '新材料让你重新回答了问题。',
        summary: `你在 ${changedCount} 个案例中调整了原判断。`,
      };
    }
    if (aiInfluence.dominant === 'question') {
      return {
        id: 'questioned-ai',
        headline: '你把AI意见当成待核验的说法。',
        summary: '在本次实验中，质疑是你最常记录的AI回应。',
      };
    }
    return {
      id: 'recorded-path',
      headline: '这份报告记录了判断如何形成。',
      summary: '它不给人格贴标签，只呈现本次实验中可追溯的选择。',
    };
  }

  function buildCommitmentOptions(visitedCount, uncertaintyCount, aiInfluence) {
    const recommendedId = !visitedCount
      ? 'source'
      : (uncertaintyCount === 0 ? 'boundary' : (aiInfluence.dominant === 'accept' ? 'independent' : 'responsibility'));
    return [
      {
        id: 'source',
        label: '先找原始材料',
        detail: '重要结论至少追到一份原始发布。',
        recommended: recommendedId === 'source',
      },
      {
        id: 'boundary',
        label: '写下结论边界',
        detail: '补上一句：当前材料还不能证明什么。',
        recommended: recommendedId === 'boundary',
      },
      {
        id: recommendedId === 'independent' ? 'independent' : 'responsibility',
        label: recommendedId === 'independent' ? '先独立作答' : '保留人的责任',
        detail: recommendedId === 'independent'
          ? '先写下自己的判断，再查看AI意见。'
          : '重要决定不把选择和后果交给模型。',
        recommended: recommendedId === 'independent' || recommendedId === 'responsibility',
      },
    ];
  }

  function buildThinkingReport(rawState, rawData) {
    const state = asObject(rawState);
    const data = asObject(rawData);
    const cases = Array.isArray(data.cases) ? data.cases : [];
    const caseMap = new Map(cases.map((item) => [item.id, item]));
    const theoryMap = new Map((Array.isArray(data.theoryUnits) ? data.theoryUnits : [])
      .map((item) => [item.id, item.title]));
    const quickAnswers = asObject(state.quickAnswers);
    const deepAnswers = asObject(state.deepAnswers);
    const visitedIds = Array.isArray(state.visitedEvidenceIds) ? state.visitedEvidenceIds : [];
    const kindsByCase = asObject(state.visitedEvidenceKinds);
    const overallPosition = asObject(state.overallPosition);
    const timeline = [];
    const observations = [];
    const usedTheory = new Set();
    const viewedEvidenceForCase = (caseId) => {
      const caseData = caseMap.get(caseId) || {};
      const evidenceIds = (caseData.evidence || []).map((item) => item.id);
      return visitedIds.filter((id) => evidenceIds.includes(id));
    };

    Object.entries(quickAnswers).forEach(([caseId, answer]) => {
      const safeAnswer = asObject(answer);
      if (!safeAnswer.initialChoice) return;
      const caseData = caseMap.get(caseId) || {};
      timeline.push({
        stage: 'quick',
        caseId,
        title: caseData.title || caseId,
        initialChoice: safeAnswer.initialChoice,
        initialLabel: choiceLabel(caseData, safeAnswer.initialChoice),
        aiReaction: safeAnswer.aiReaction ? reactionLabel(safeAnswer.aiReaction) : null,
        theoryLabels: (caseData.theoryLinks || []).map((id) => theoryMap.get(id)).filter(Boolean),
        evidenceRefs: [`quick:${caseId}:initial`, safeAnswer.aiReaction ? `quick:${caseId}:ai-reaction` : null].filter(Boolean),
      });
      (caseData.theoryLinks || []).forEach((id) => usedTheory.add(id));
    });

    Object.entries(deepAnswers).forEach(([caseId, answer]) => {
      const safeAnswer = asObject(answer);
      const caseData = caseMap.get(caseId) || {};
      const kinds = Array.isArray(kindsByCase[caseId]) ? kindsByCase[caseId] : [];
      const viewed = viewedEvidenceForCase(caseId);
      timeline.push({
        stage: 'deep',
        caseId,
        title: caseData.title || caseId,
        initialChoice: safeAnswer.initialChoice || null,
        initialLabel: safeAnswer.initialChoice ? choiceLabel(caseData, safeAnswer.initialChoice) : null,
        finalChoice: safeAnswer.finalChoice || null,
        finalLabel: safeAnswer.finalChoice ? choiceLabel(caseData, safeAnswer.finalChoice) : null,
        reasonType: safeAnswer.reasonType || null,
        changed: typeof safeAnswer.changed === 'boolean' ? safeAnswer.changed : null,
        evidenceViewed: viewed,
        evidenceKinds: kinds,
        theoryLabels: (caseData.theoryLinks || []).map((id) => theoryMap.get(id)).filter(Boolean),
        evidenceRefs: [
          safeAnswer.initialChoice ? `deep:${caseId}:initial` : null,
          viewed.length ? `deep:${caseId}:evidence` : null,
          safeAnswer.finalChoice ? `deep:${caseId}:final` : null,
        ].filter(Boolean),
      });
      (caseData.theoryLinks || []).forEach((id) => usedTheory.add(id));

      if (safeAnswer.finalChoice && safeAnswer.changed === false && viewed.length) {
        observations.push({
          id: 'reasoned-persistence',
          text: `在“${caseData.title || caseId}”中，你查看材料后保留了原判断，并记录了依据。`,
          evidenceRefs: [`deep:${caseId}:evidence`, `deep:${caseId}:final`],
        });
      }
      if (safeAnswer.finalChoice && safeAnswer.changed === true && viewed.length) {
        observations.push({
          id: 'evidence-led-revision',
          text: `在“${caseData.title || caseId}”中，新材料进入后，你调整了原判断。`,
          evidenceRefs: [`deep:${caseId}:initial`, `deep:${caseId}:evidence`, `deep:${caseId}:final`],
        });
      }
      if (safeAnswer.finalChoice && safeAnswer.changed === true && !viewed.length) {
        observations.push({
          id: 'revision-without-trace',
          text: `在“${caseData.title || caseId}”中，记录显示判断发生变化，但没有可追踪的材料查看记录。`,
          evidenceRefs: [`deep:${caseId}:initial`, `deep:${caseId}:final`],
        });
      }
    });

    const quickInitialCount = Object.values(quickAnswers).filter((item) => asObject(item).initialChoice).length;
    const aiReactionCount = Object.values(quickAnswers).filter((item) => asObject(item).aiReaction).length;
    const deepFinalCount = Object.values(deepAnswers).filter((item) => asObject(item).finalChoice).length;
    const uncertaintyCount = Object.values(deepAnswers).filter((item) => asObject(item).reasonType === '仍需更多材料').length;
    const evidenceReconsideredCount = Object.entries(deepAnswers).filter(([caseId, item]) => (
      asObject(item).finalChoice && viewedEvidenceForCase(caseId).length
    )).length;
    const changedCount = Object.entries(deepAnswers).filter(([caseId, item]) => (
      asObject(item).changed === true && asObject(item).finalChoice && viewedEvidenceForCase(caseId).length
    )).length;
    const persistedCount = Object.entries(deepAnswers).filter(([caseId, item]) => (
      asObject(item).changed === false && asObject(item).finalChoice && viewedEvidenceForCase(caseId).length
    )).length;
    const reactionCounts = { accept: 0, question: 0, hold: 0 };
    Object.values(quickAnswers).forEach((item) => {
      const reaction = asObject(item).aiReaction;
      if (Object.hasOwn(reactionCounts, reaction)) reactionCounts[reaction] += 1;
    });
    const reactionTotal = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
    const dominant = dominantReaction(reactionCounts);
    const aiStatements = {
      accept: `你在 ${reactionCounts.accept} 次回应中接受了AI判断，这些节点值得回看依据是否充分。`,
      question: `你更常把AI意见当成需要质疑和核验的说法。`,
      hold: `你更常在AI意见前保留判断，等待更充分的材料。`,
      mixed: '你的几种AI回应次数相同，没有一种反应占据主导。',
    };
    const aiInfluence = {
      counts: reactionCounts,
      total: reactionTotal,
      dominant,
      statement: dominant ? aiStatements[dominant] : '本次记录还没有形成可回看的AI回应。',
    };

    if (quickInitialCount) {
      observations.unshift({
        id: 'independent-first',
        text: `你在查看AI意见前完成了 ${quickInitialCount} 次独立判断。`,
        evidenceRefs: Object.keys(quickAnswers).filter((id) => asObject(quickAnswers[id]).initialChoice).map((id) => `quick:${id}:initial`),
      });
    }
    if (aiReactionCount) {
      observations.push({
        id: 'ai-response',
        text: `你对 ${aiReactionCount} 份AI意见记录了接受、质疑或保留。`,
        evidenceRefs: Object.keys(quickAnswers).filter((id) => asObject(quickAnswers[id]).aiReaction).map((id) => `quick:${id}:ai-reaction`),
      });
    }
    if (overallPosition.initialChoice && overallPosition.finalChoice) {
      observations.push({
        id: 'theme-reconsideration',
        text: overallPosition.initialChoice === overallPosition.finalChoice
          ? '完成全部核验后，你保留了对主题问题的原判断。'
          : '完成全部核验后，你对主题问题的回答发生了变化。',
        evidenceRefs: ['overall:initial', 'overall:final'],
      });
    }

    const dimensions = [
      {
        id: 'independent-judgment',
        label: '独立判断',
        summary: quickInitialCount
          ? `AI介入前记录了 ${quickInitialCount} 次判断。`
          : '尚未形成可追踪的独立判断。',
        evidenceRefs: Object.keys(quickAnswers).filter((id) => asObject(quickAnswers[id]).initialChoice).map((id) => `quick:${id}:initial`),
      },
      {
        id: 'evidence-checking',
        label: '证据核验',
        summary: visitedIds.length
          ? `打开了 ${visitedIds.length} 份材料，并留下查看记录。`
          : '尚未留下材料查看记录。',
        evidenceRefs: Object.keys(kindsByCase).filter((id) => kindsByCase[id] && kindsByCase[id].length).map((id) => `deep:${id}:evidence`),
      },
      {
        id: 'revision',
        label: '观点修正',
        summary: deepFinalCount
          ? `完成了 ${deepFinalCount} 次再次判断，改变与坚持都按依据记录。`
          : '尚未完成再次判断。',
        evidenceRefs: Object.keys(deepAnswers).filter((id) => asObject(deepAnswers[id]).finalChoice).map((id) => `deep:${id}:final`),
      },
      {
        id: 'uncertainty',
        label: '不确定性意识',
        summary: uncertaintyCount
          ? `有 ${uncertaintyCount} 次明确保留“仍需更多材料”。`
          : '可继续关注哪些结论边界和未知条件被主动记录。',
        evidenceRefs: Object.keys(deepAnswers).filter((id) => asObject(deepAnswers[id]).reasonType === '仍需更多材料').map((id) => `deep:${id}:final`),
      },
    ];

    const practiceSuggestions = [];
    if (!visitedIds.length) practiceSuggestions.push('下一次遇到关键结论时，至少追到一份原始材料。');
    if (!uncertaintyCount) practiceSuggestions.push('写结论时增加一句：当前材料还不能证明什么。');
    if (aiReactionCount) practiceSuggestions.push('把AI回答拆成事实、推断、价值选择和未知，再逐项处理。');
    if (!practiceSuggestions.length) practiceSuggestions.push('把核验方法带入下一次真实的信息判断，并根据结果继续修正。');

    const overallChanged = overallPosition.initialChoice && overallPosition.finalChoice
      ? overallPosition.initialChoice !== overallPosition.finalChoice
      : null;
    const reactionTitles = {
      accept: '你记录了接受AI判断的时刻',
      question: '你向AI提出了质疑',
      hold: '你在AI意见前保留了判断',
      mixed: '你对AI保持了不止一种回应',
    };
    const moments = [
      {
        id: 'theme-position',
        title: overallChanged === true
          ? '最后一次回答改变了'
          : (overallChanged === false ? '最后一次回答保留了' : '等待最后一次回答'),
        text: overallPosition.initialChoice && overallPosition.finalChoice
          ? `从“${positionLabel(overallPosition.initialChoice)}”到“${positionLabel(overallPosition.finalChoice)}”。`
          : '当前还没有完成主题问题的再次回答。',
        evidenceRefs: ['overall:initial', overallPosition.finalChoice ? 'overall:final' : null].filter(Boolean),
      },
      {
        id: 'ai-reaction',
        title: dominant ? reactionTitles[dominant] : 'AI意见还没有进入回看记录',
        text: reactionTotal ? `共记录 ${reactionTotal} 次AI回应。` : '完成快速判断后，这里会显示AI如何影响你。',
        evidenceRefs: Object.keys(quickAnswers).filter((id) => asObject(quickAnswers[id]).aiReaction).map((id) => `quick:${id}:ai-reaction`),
      },
      {
        id: 'evidence-use',
        title: visitedIds.length ? `你打开了 ${visitedIds.length} 份材料` : '你还没有打开核验材料',
        text: visitedIds.length
          ? (evidenceReconsideredCount
            ? `这些材料进入了 ${evidenceReconsideredCount} 次再次判断。`
            : '材料已经打开，但还没有进入一次完整的再次判断。')
          : (deepFinalCount
            ? '已记录再次判断，但没有可追踪的材料查看记录。'
            : '进入深度案例后，这里会记录材料如何参与判断。'),
        evidenceRefs: Object.keys(kindsByCase).filter((id) => kindsByCase[id] && kindsByCase[id].length).map((id) => `deep:${id}:evidence`),
      },
    ];

    return {
      status: state.phase === 'complete' ? 'complete' : 'partial',
      generatedAt: localDateStamp(),
      lead: buildLead(overallPosition, changedCount, persistedCount, aiInfluence),
      metrics: {
        independentJudgments: quickInitialCount,
        evidenceViewed: visitedIds.length,
        reconsideredCases: deepFinalCount,
      },
      moments,
      aiInfluence,
      positionTrace: {
        initialChoice: overallPosition.initialChoice || null,
        initialLabel: overallPosition.initialChoice ? positionLabel(overallPosition.initialChoice) : null,
        finalChoice: overallPosition.finalChoice || null,
        finalLabel: overallPosition.finalChoice ? positionLabel(overallPosition.finalChoice) : null,
        changed: overallPosition.initialChoice && overallPosition.finalChoice
          ? overallPosition.initialChoice !== overallPosition.finalChoice
          : null,
      },
      timeline,
      dimensions,
      observations,
      theoryLinks: [...usedTheory],
      commitmentOptions: buildCommitmentOptions(visitedIds.length, uncertaintyCount, aiInfluence),
      practiceSuggestions,
    };
  }

  return { buildThinkingReport };
});
