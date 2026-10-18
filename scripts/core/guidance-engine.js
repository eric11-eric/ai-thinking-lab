(function attachGuidanceEngine(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AIThinkingGuidanceEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createGuidanceEngine() {
  const DIMENSIONS = ['agency', 'practice', 'contradiction', 'revision', 'humanity'];

  function evidenceForDimension(dimension, direction, answers, questions) {
    const candidates = [];
    (Array.isArray(questions) ? questions : []).forEach((question, questionIndex) => {
      const optionId = answers && answers[question.id];
      if (!optionId || !Array.isArray(question.options)) return;
      const option = question.options.find((candidate) => candidate.id === optionId);
      const weight = option && option.weights ? option.weights[dimension] : undefined;
      if (typeof weight !== 'number') return;
      candidates.push({ question, option, weight, questionIndex });
    });
    candidates.sort((left, right) => {
      if (direction === 'low') return left.weight - right.weight || left.questionIndex - right.questionIndex;
      if (direction === 'high') return right.weight - left.weight || left.questionIndex - right.questionIndex;
      return Math.abs(left.weight) - Math.abs(right.weight) || left.questionIndex - right.questionIndex;
    });
    return candidates[0] || null;
  }

  function traceableDimensions(scores, direction, answers, questions) {
    const threshold = direction === 'low' ? 34 : 80;
    return DIMENSIONS
      .filter((dimension) => {
        const score = Number(scores && scores[dimension]);
        const extreme = direction === 'low' ? score <= threshold : score >= threshold;
        return extreme && evidenceForDimension(dimension, direction, answers, questions);
      })
      .sort((left, right) => {
        const difference = direction === 'low'
          ? Number(scores[left]) - Number(scores[right])
          : Number(scores[right]) - Number(scores[left]);
        return difference || DIMENSIONS.indexOf(left) - DIMENSIONS.indexOf(right);
      });
  }

  function fallbackDimension(portrait, answers, questions) {
    const preferred = portrait && portrait.type && Array.isArray(portrait.type.dimensions)
      ? portrait.type.dimensions
      : [];
    return [...preferred, ...DIMENSIONS].find((dimension, index, list) => (
      DIMENSIONS.includes(dimension)
      && list.indexOf(dimension) === index
      && evidenceForDimension(dimension, 'balanced', answers, questions)
    )) || DIMENSIONS[0];
  }

  function buildEvidence(candidate, dimension, direction) {
    const rationale = direction === 'low'
      ? '这个选择把判断更多交给了现成路径，因此指导从这里开始。'
      : direction === 'high'
        ? '这个选择明显强化了该维度，所以需要同时提醒它的边界。'
        : '这个选择与当前画像主线相关，可以用来开始下一轮实践。';
    return {
      questionId: candidate.question.id,
      optionId: candidate.option.id,
      context: candidate.question.context,
      choice: candidate.option.label,
      dimension,
      direction,
      weight: candidate.weight,
      rationale,
    };
  }

  function buildGuidance({ portrait, answers, questions, guidanceUnits }) {
    const scores = portrait && portrait.scores ? portrait.scores : {};
    const units = Array.isArray(guidanceUnits) ? guidanceUnits : [];
    const lowDimensions = traceableDimensions(scores, 'low', answers, questions);
    const highDimensions = traceableDimensions(scores, 'high', answers, questions);
    const direction = lowDimensions.length > 0 ? 'low' : highDimensions.length > 0 ? 'high' : 'balanced';
    const dimension = direction === 'low'
      ? lowDimensions[0]
      : direction === 'high'
        ? highDimensions[0]
        : fallbackDimension(portrait, answers, questions);
    const unit = units.find((candidate) => candidate.dimension === dimension) || units[0];
    const evidenceCandidate = evidenceForDimension(dimension, direction, answers, questions);

    if (!unit || !evidenceCandidate) {
      return {
        label: '马原提醒你',
        dimension,
        direction: 'balanced',
        punchline: '画像要回到实践中才能继续生长。',
        anchor: '实践、认识、再实践、再认识。',
        explanation: '当前记录还不足以支持针对某一维度的判断，先保留结论。',
        evidence: null,
        exercise: '完成一次真实行动后，记下结果并重新回看这张画像。',
        followUp: '不把本次结果当成固定身份。',
      };
    }

    const branch = direction === 'balanced' ? null : unit[direction];
    return {
      label: '马原提醒你',
      dimension,
      direction,
      punchline: branch ? branch.punchline : `把${unit.label}的优势，带回下一轮实践。`,
      anchor: branch ? branch.anchor : unit.low.anchor,
      explanation: branch
        ? branch.explanation
        : `你的${unit.label}没有呈现明显低位或极端高位。${unit.defaultStrength}这次结果只是一个可以被后续行动修正的起点。`,
      evidence: buildEvidence(evidenceCandidate, dimension, direction),
      exercise: branch ? branch.exercise : '下次遇到相似情境时，先记录初始判断，再把行动结果与这次选择对照。',
      followUp: branch ? branch.followUp : '画像描述的是本次情境，不是固定身份。',
    };
  }

  return { buildGuidance };
});
