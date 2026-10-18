(function attachPortraitEngine(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AIThinkingPortraitEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPortraitEngine() {
  const DIMENSIONS = ['agency', 'practice', 'contradiction', 'revision', 'humanity'];

  function emptyDimensionRecord(initialValue) {
    return Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, initialValue]));
  }

  function scoreDimensions(answers, questions) {
    const safeAnswers = answers && typeof answers === 'object' ? answers : {};
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const questionById = new Map(safeQuestions.map((question) => [question.id, question]));
    const raw = emptyDimensionRecord(0);
    const availableMin = emptyDimensionRecord(0);
    const availableMax = emptyDimensionRecord(0);
    const evidenceByDimension = emptyDimensionRecord(null);
    const errors = [];

    DIMENSIONS.forEach((dimension) => {
      evidenceByDimension[dimension] = [];
    });

    Object.entries(safeAnswers).forEach(([questionId, optionId]) => {
      const question = questionById.get(questionId);
      if (!question) {
        errors.push({ code: 'unknown-question', questionId, optionId });
        return;
      }
      const options = Array.isArray(question.options) ? question.options : [];
      const option = options.find((candidate) => candidate.id === optionId);
      if (!option) {
        errors.push({ code: 'unknown-option', questionId, optionId });
        return;
      }
      const selectedWeights = option.weights && typeof option.weights === 'object' ? option.weights : {};
      Object.entries(selectedWeights).forEach(([dimension, weight]) => {
        if (!DIMENSIONS.includes(dimension) || typeof weight !== 'number') return;
        const possible = options.map((candidate) => {
          const weights = candidate.weights && typeof candidate.weights === 'object' ? candidate.weights : {};
          return typeof weights[dimension] === 'number' ? weights[dimension] : 0;
        });
        raw[dimension] += weight;
        availableMin[dimension] += Math.min(...possible);
        availableMax[dimension] += Math.max(...possible);
        evidenceByDimension[dimension].push({
          questionId,
          optionId,
          weight,
          contextTags: Array.isArray(question.contextTags) ? [...question.contextTags] : [],
        });
      });
    });

    const normalized = emptyDimensionRecord(50);
    DIMENSIONS.forEach((dimension) => {
      const range = availableMax[dimension] - availableMin[dimension];
      if (range > 0) {
        normalized[dimension] = Math.round(((raw[dimension] - availableMin[dimension]) / range) * 100);
      }
    });

    return { raw, normalized, evidenceByDimension, errors };
  }

  function analyzeConsistency(answers, questions) {
    const safeAnswers = answers && typeof answers === 'object' ? answers : {};
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const byDimension = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, { stable: true, pairs: [] }]));
    const groups = new Map();

    safeQuestions.forEach((question) => {
      if (!question || question.phase !== 'base' || !question.consistencyKey) return;
      const group = groups.get(question.consistencyKey) || [];
      group.push(question);
      groups.set(question.consistencyKey, group);
    });

    groups.forEach((pairedQuestions, consistencyKey) => {
      if (pairedQuestions.length !== 2) return;
      const dimension = pairedQuestions[0].dimension;
      if (!DIMENSIONS.includes(dimension)) return;
      const contributions = pairedQuestions.map((question) => {
        const optionId = safeAnswers[question.id];
        const option = Array.isArray(question.options) ? question.options.find((candidate) => candidate.id === optionId) : null;
        const weight = option && option.weights ? option.weights[dimension] : undefined;
        return { questionId: question.id, optionId, weight };
      });
      if (contributions.some((entry) => typeof entry.weight !== 'number')) return;
      const difference = Math.abs(contributions[0].weight - contributions[1].weight);
      const stable = difference < 3;
      byDimension[dimension].pairs.push({ consistencyKey, difference, stable, contributions });
      if (!stable) byDimension[dimension].stable = false;
    });

    return {
      byDimension,
      unstableDimensions: DIMENSIONS.filter((dimension) => !byDimension[dimension].stable),
    };
  }

  function selectCalibrationQuestions(answers, questions, limit = 5) {
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const pool = safeQuestions.filter((question) => question && question.phase === 'calibration');
    const base = safeQuestions.filter((question) => question && question.phase === 'base');
    const maxSelection = Math.max(0, Math.min(5, Number.isFinite(limit) ? Math.floor(limit) : 5));
    const selected = [];
    const selectedSet = new Set();

    function includesDimension(question, dimension) {
      return question.dimension === dimension || question.secondaryDimension === dimension;
    }

    function addFirst(predicate) {
      if (selected.length >= maxSelection) return;
      const match = pool.find((question) => !selectedSet.has(question.id) && predicate(question));
      if (!match) return;
      selected.push(match.id);
      selectedSet.add(match.id);
    }

    const consistency = analyzeConsistency(answers, base);
    consistency.unstableDimensions.forEach((dimension) => {
      addFirst((question) => includesDimension(question, dimension));
    });

    const score = scoreDimensions(answers, base);
    const ranked = [...DIMENSIONS].sort((left, right) => {
      const difference = score.normalized[right] - score.normalized[left];
      return difference || DIMENSIONS.indexOf(left) - DIMENSIONS.indexOf(right);
    });
    const first = ranked[0];
    const second = ranked[1];
    if (score.evidenceByDimension[first].length > 0 && score.evidenceByDimension[second].length > 0 && Math.abs(score.normalized[first] - score.normalized[second]) < 8) {
      addFirst((question) => includesDimension(question, first) && includesDimension(question, second));
      if (!selected.some((id) => {
        const question = pool.find((candidate) => candidate.id === id);
        return question && includesDimension(question, first) && includesDimension(question, second);
      })) {
        addFirst((question) => includesDimension(question, first));
      }
    }

    const answeredPrimary = emptyDimensionRecord(0);
    base.forEach((question) => {
      const optionId = answers && answers[question.id];
      if (Array.isArray(question.options) && question.options.some((option) => option.id === optionId)) answeredPrimary[question.dimension] += 1;
    });
    const highestCoverage = Math.max(...Object.values(answeredPrimary));
    DIMENSIONS
      .filter((dimension) => answeredPrimary[dimension] < highestCoverage)
      .sort((left, right) => answeredPrimary[left] - answeredPrimary[right] || DIMENSIONS.indexOf(left) - DIMENSIONS.indexOf(right))
      .forEach((dimension) => addFirst((question) => includesDimension(question, dimension)));

    return selected;
  }

  function dimensionKey(dimensions) {
    return [...dimensions]
      .sort((left, right) => DIMENSIONS.indexOf(left) - DIMENSIONS.indexOf(right))
      .join('|');
  }

  function selectPortraitType(normalizedScores, portraitTypes) {
    const scores = normalizedScores && typeof normalizedScores === 'object' ? normalizedScores : {};
    const types = Array.isArray(portraitTypes) ? portraitTypes : [];
    const ranked = [...DIMENSIONS].sort((left, right) => {
      const difference = (Number(scores[right]) || 0) - (Number(scores[left]) || 0);
      return difference || DIMENSIONS.indexOf(left) - DIMENSIONS.indexOf(right);
    });
    const selectedDimensions = (Number(scores[ranked[0]]) || 0) - (Number(scores[ranked[1]]) || 0) > 12
      ? [ranked[0]]
      : [ranked[0], ranked[1]];
    const wantedKey = dimensionKey(selectedDimensions);
    return types.find((portrait) => Array.isArray(portrait.dimensions) && dimensionKey(portrait.dimensions) === wantedKey) || null;
  }

  const DIMENSION_LABELS = {
    agency: '主体性',
    practice: '实践核验',
    contradiction: '矛盾意识',
    revision: '修正开放',
    humanity: '人本责任',
  };

  function rounded(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function describeContext(tag, averageWeight) {
    if (averageWeight === 0) return `在“${tag}”情境中，你的选择没有呈现稳定方向，更接近中性位置。`;
    const high = averageWeight > 0;
    const descriptions = {
      'AI语气': high ? '面对 AI 的肯定语气，你仍倾向保留自己的判断入口。' : 'AI 的肯定语气较容易推动你采用现成答案。',
      '群体意见': high ? '面对多数意见，你会先检查理由和具体条件。' : '群体意见容易成为你快速确定方向的依据。',
      '时间压力': high ? '即使时间紧，你仍愿意为关键材料调整原结论。' : '时间压力下，你更可能优先保住已经完成的方案。',
      '证据来源': high ? '来源是否可追溯，会明显影响你是否采用一个结论。' : '当内容足够具体时，你有时会暂时放低对原始来源的要求。',
      '人的后果': high ? '你会把选择权、负担和可能受伤的人放进方案。' : '效率和可执行性容易比具体受影响者更早进入你的判断。',
      '效率压力': high ? '面对效率要求，你会同时寻找不能被转嫁的代价。' : '当方案能明显提速时，你更愿意先验证效率收益。',
      '新材料': high ? '新材料会真正推动你改写原先的判断。' : '新材料出现后，你往往先尝试把它放入原有结论。',
    };
    return descriptions[tag] || `在“${tag}”情境中，你${high ? '更倾向主动检查判断条件' : '更倾向先采用现成路径'}。`;
  }

  function buildPortraitResult({ answers, questions, portraitTypes }) {
    const safeAnswers = answers && typeof answers === 'object' ? answers : {};
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const questionById = new Map(safeQuestions.map((question, index) => [question.id, { question, index }]));
    const score = scoreDimensions(safeAnswers, safeQuestions);
    const type = selectPortraitType(score.normalized, portraitTypes);

    const representativeByQuestion = new Map();
    DIMENSIONS.forEach((dimension) => {
      score.evidenceByDimension[dimension].forEach((evidence) => {
        const current = representativeByQuestion.get(evidence.questionId);
        if (!current || Math.abs(evidence.weight) > Math.abs(current.weight)) {
          representativeByQuestion.set(evidence.questionId, { ...evidence, dimension });
        }
      });
    });
    const representatives = [...representativeByQuestion.values()].sort((left, right) => {
      const strength = Math.abs(right.weight) - Math.abs(left.weight);
      const leftIndex = questionById.get(left.questionId)?.index ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = questionById.get(right.questionId)?.index ?? Number.MAX_SAFE_INTEGER;
      return strength || leftIndex - rightIndex;
    });
    const moments = representatives.slice(0, 3).map((evidence) => {
      const entry = questionById.get(evidence.questionId);
      const option = entry.question.options.find((candidate) => candidate.id === evidence.optionId);
      const direction = evidence.weight > 0 ? 'high' : evidence.weight < 0 ? 'low' : 'middle';
      return {
        questionId: evidence.questionId,
        optionId: evidence.optionId,
        context: entry.question.context,
        choice: option.label,
        dimension: evidence.dimension,
        direction,
        explanation: direction === 'middle'
          ? `这个选择更接近${DIMENSION_LABELS[evidence.dimension]}光谱中部，没有单独推高或压低这一维度。`
          : `这个选择在${DIMENSION_LABELS[evidence.dimension]}上留下了明显信号。`,
      };
    });

    const answerEvidence = safeQuestions.flatMap((question) => {
      const optionId = safeAnswers[question.id];
      const option = Array.isArray(question.options)
        ? question.options.find((candidate) => candidate.id === optionId)
        : null;
      if (!option) return [];
      const weights = Object.entries(option.weights || {})
        .filter(([dimension, weight]) => DIMENSIONS.includes(dimension) && typeof weight === 'number')
        .map(([dimension, weight]) => ({
          dimension,
          label: DIMENSION_LABELS[dimension],
          weight,
          direction: weight > 0 ? 'high' : weight < 0 ? 'low' : 'middle',
        }));
      return [{
        questionId: question.id,
        optionId,
        context: question.context,
        prompt: question.prompt,
        choice: option.label,
        weights,
      }];
    });

    const contexts = new Map();
    representatives.forEach((evidence) => {
      const entry = questionById.get(evidence.questionId);
      const tags = Array.isArray(entry.question.contextTags) ? entry.question.contextTags : [];
      tags.forEach((tag) => {
        const aggregate = contexts.get(tag) || { tag, total: 0, count: 0, evidenceRefs: [], firstIndex: entry.index };
        aggregate.total += evidence.weight;
        aggregate.count += 1;
        if (!aggregate.evidenceRefs.includes(evidence.questionId)) aggregate.evidenceRefs.push(evidence.questionId);
        aggregate.firstIndex = Math.min(aggregate.firstIndex, entry.index);
        contexts.set(tag, aggregate);
      });
    });
    const contextFeatures = [...contexts.values()]
      .map((aggregate) => ({
        tag: aggregate.tag,
        averageWeight: rounded(aggregate.total / aggregate.count),
        evidenceRefs: aggregate.evidenceRefs,
        firstIndex: aggregate.firstIndex,
      }))
      .sort((left, right) => Math.abs(right.averageWeight) - Math.abs(left.averageWeight) || right.evidenceRefs.length - left.evidenceRefs.length || left.firstIndex - right.firstIndex)
      .slice(0, 2)
      .map((feature) => ({
        tag: feature.tag,
        text: describeContext(feature.tag, feature.averageWeight),
        evidenceRefs: feature.evidenceRefs,
      }));

    const lowestDimension = [...DIMENSIONS].sort((left, right) => score.normalized[left] - score.normalized[right] || DIMENSIONS.indexOf(left) - DIMENSIONS.indexOf(right))[0];
    const summary = `${type ? type.coreDescription : '你的选择形成了一张情境化思考画像。'} 相比之下，${DIMENSION_LABELS[lowestDimension]}更靠近光谱左侧，它提醒你在下一次行动中多检查一个环节。`;
    const portraitParams = {
      shapeRadius: rounded(38 + score.normalized.agency * 0.22),
      rotation: rounded((score.normalized.revision - 50) * 0.28),
      layerGap: rounded(6 + score.normalized.contradiction * 0.12),
      colorRatio: rounded(score.normalized.practice / 100),
      contourOpenness: rounded(score.normalized.humanity / 100),
    };
    const evidenceRefs = [...new Set([
      ...moments.map((moment) => moment.questionId),
      ...contextFeatures.flatMap((feature) => feature.evidenceRefs),
    ])];

    return {
      type,
      scores: { ...score.normalized },
      contextFeatures,
      moments,
      summary,
      portraitParams,
      evidenceRefs,
      answerEvidence,
      consistency: analyzeConsistency(safeAnswers, safeQuestions),
    };
  }

  return { DIMENSIONS, DIMENSION_LABELS, scoreDimensions, analyzeConsistency, selectCalibrationQuestions, selectPortraitType, buildPortraitResult };
});
