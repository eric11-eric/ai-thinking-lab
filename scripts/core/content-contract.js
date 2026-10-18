(function attachContentContract(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AIThinkingContent = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createContentContract() {
  function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function validateContent(data) {
    const errors = [];
    const cases = Array.isArray(data && data.cases) ? data.cases : [];
    const sources = Array.isArray(data && data.sources) ? data.sources : [];
    const sourceIds = new Set(sources.map((source) => source && source.id).filter(Boolean));

    if (cases.length < 6) {
      errors.push({ code: 'case-count', message: '正式案例不得少于六个。' });
    }

    if (sources.length < 15) {
      errors.push({ code: 'source-count', message: '可核验来源不得少于十五条。' });
    }

    sources.forEach((source, index) => {
      ['id', 'title', 'institution', 'date', 'url'].forEach((field) => {
        if (!hasText(source && source[field])) {
          errors.push({
            code: 'source-field',
            message: `来源 ${index + 1} 缺少 ${field}。`,
            path: `sources[${index}].${field}`,
          });
        }
      });
    });

    cases.forEach((caseData, index) => {
      const label = hasText(caseData && caseData.id) ? caseData.id : `cases[${index}]`;
      const references = Array.isArray(caseData && caseData.sourceIds) ? caseData.sourceIds : [];

      if (!hasText(caseData && caseData.uncertaintyNote)) {
        errors.push({
          code: 'uncertainty-note',
          message: `${label} 缺少结论边界说明。`,
        });
      }

      references.forEach((sourceId) => {
        if (!sourceIds.has(sourceId)) {
          errors.push({
            code: 'unknown-source',
            message: `${label} 引用了不存在的来源 ${sourceId}。`,
          });
        }
      });

      if (caseData && caseData.mode === 'deep') {
        const evidence = Array.isArray(caseData.evidence) ? caseData.evidence : [];
        if (evidence.length === 0) {
          errors.push({
            code: 'deep-evidence',
            message: `${label} 是深度案例，但没有证据材料。`,
          });
        }
        evidence.forEach((item) => {
          const evidenceSources = Array.isArray(item && item.sourceIds) ? item.sourceIds : [];
          if (evidenceSources.length === 0) {
            errors.push({
              code: 'evidence-source',
              message: `${label} 的证据 ${item && item.id ? item.id : 'unknown'} 没有来源。`,
            });
          }
          evidenceSources.forEach((sourceId) => {
            if (!sourceIds.has(sourceId)) {
              errors.push({
                code: 'unknown-source',
                message: `${label} 的证据引用了不存在的来源 ${sourceId}。`,
              });
            }
          });
        });
      }
    });

    return { valid: errors.length === 0, errors };
  }

  const PORTRAIT_DIMENSIONS = ['agency', 'practice', 'contradiction', 'revision', 'humanity'];

  function validatePortraitContent(data) {
    const errors = [];
    const questions = Array.isArray(data && data.portraitQuestions) ? data.portraitQuestions : [];
    const portraitTypes = Array.isArray(data && data.portraitTypes) ? data.portraitTypes : [];
    const portraitAnalyses = Array.isArray(data && data.portraitAnalyses) ? data.portraitAnalyses : [];
    const guidanceUnits = Array.isArray(data && data.guidanceUnits) ? data.guidanceUnits : [];
    const theoryUnits = Array.isArray(data && data.theoryUnits) ? data.theoryUnits : [];
    const theoryIds = new Set(theoryUnits.map((unit) => unit && unit.id).filter(Boolean));
    const dimensionSet = new Set(PORTRAIT_DIMENSIONS);

    if (questions.length !== 35) errors.push({ code: 'portrait-question-count', message: '画像题库必须包含 35 道题。' });
    if (questions.filter((item) => item && item.phase === 'base').length !== 25) errors.push({ code: 'portrait-base-count', message: '基础题必须为 25 道。' });
    if (questions.filter((item) => item && item.phase === 'calibration').length !== 10) errors.push({ code: 'portrait-calibration-count', message: '校准题必须为 10 道。' });

    const seenQuestionIds = new Set();
    questions.forEach((item, questionIndex) => {
      const path = `portraitQuestions[${questionIndex}]`;
      if (!hasText(item && item.id) || seenQuestionIds.has(item.id)) {
        errors.push({ code: 'portrait-question-id', message: `题目 ${questionIndex + 1} 缺少唯一 ID。`, path: `${path}.id` });
      } else {
        seenQuestionIds.add(item.id);
      }
      if (!item || !dimensionSet.has(item.dimension) || (item.secondaryDimension && !dimensionSet.has(item.secondaryDimension))) {
        errors.push({ code: 'portrait-dimension', message: `${item && item.id ? item.id : path} 使用了未知维度。`, path: `${path}.dimension` });
      }
      ['context', 'prompt', 'theoryAnchor'].forEach((field) => {
        if (!hasText(item && item[field])) errors.push({ code: 'portrait-question-field', message: `${item && item.id ? item.id : path} 缺少 ${field}。`, path: `${path}.${field}` });
      });
      if (item && hasText(item.theoryAnchor) && !theoryIds.has(item.theoryAnchor)) {
        errors.push({ code: 'portrait-unknown-theory', message: `${item.id || path} 引用了不存在的理论单元。`, path: `${path}.theoryAnchor` });
      }
      if (!Array.isArray(item && item.contextTags) || item.contextTags.length === 0) {
        errors.push({ code: 'portrait-context-tags', message: `${item && item.id ? item.id : path} 缺少情境标签。`, path: `${path}.contextTags` });
      }
      const options = Array.isArray(item && item.options) ? item.options : [];
      if (options.length !== 3) errors.push({ code: 'portrait-option-count', message: `${item && item.id ? item.id : path} 必须包含三个选项。`, path: `${path}.options` });
      const optionIds = new Set();
      options.forEach((option, optionIndex) => {
        const optionPath = `${path}.options[${optionIndex}]`;
        if (!hasText(option && option.id) || optionIds.has(option.id) || !hasText(option && option.label)) {
          errors.push({ code: 'portrait-option-field', message: `${item && item.id ? item.id : path} 的选项缺少唯一 ID 或文字。`, path: optionPath });
        } else {
          optionIds.add(option.id);
        }
        const weights = option && option.weights && typeof option.weights === 'object' ? option.weights : {};
        const primaryWeight = item && weights[item.dimension];
        if (typeof primaryWeight !== 'number' || primaryWeight < -2 || primaryWeight > 2) {
          errors.push({ code: 'portrait-option-weight', message: `${item && item.id ? item.id : path} 的主维度权重缺失或越界。`, path: `${optionPath}.weights.${item && item.dimension ? item.dimension : 'unknown'}` });
        }
        Object.entries(weights).forEach(([dimension, weight]) => {
          if (!dimensionSet.has(dimension)) {
            errors.push({ code: 'portrait-option-dimension', message: `${item && item.id ? item.id : path} 的选项权重使用了未知维度。`, path: `${optionPath}.weights.${dimension}` });
            return;
          }
          const limit = dimension === (item && item.dimension) ? 2 : 1;
          if (typeof weight !== 'number' || weight < -limit || weight > limit) {
            errors.push({ code: 'portrait-option-weight', message: `${item && item.id ? item.id : path} 的权重越界。`, path: `${optionPath}.weights.${dimension}` });
          }
        });
      });
    });

    PORTRAIT_DIMENSIONS.forEach((dimension) => {
      const count = questions.filter((item) => item && item.phase === 'base' && item.dimension === dimension).length;
      if (count !== 5) errors.push({ code: 'portrait-dimension-coverage', message: `${dimension} 必须有五道基础题。` });
    });

    const consistencyCounts = new Map();
    questions.filter((item) => item && item.phase === 'base' && item.consistencyKey).forEach((item) => {
      consistencyCounts.set(item.consistencyKey, (consistencyCounts.get(item.consistencyKey) || 0) + 1);
    });
    if (consistencyCounts.size !== 5 || [...consistencyCounts.values()].some((count) => count !== 2)) {
      errors.push({ code: 'portrait-consistency-pairs', message: '基础题必须包含五组成对的复测题。' });
    }

    const dimensionIndex = new Map(PORTRAIT_DIMENSIONS.map((dimension, index) => [dimension, index]));
    const pairKey = (left, right) => [left, right]
      .sort((a, b) => dimensionIndex.get(a) - dimensionIndex.get(b))
      .join('|');
    const expectedCalibrationPairs = new Set();
    PORTRAIT_DIMENSIONS.forEach((left, index) => {
      PORTRAIT_DIMENSIONS.slice(index + 1).forEach((right) => expectedCalibrationPairs.add(pairKey(left, right)));
    });
    const calibrationQuestions = questions.filter((item) => item && item.phase === 'calibration');
    const actualCalibrationPairs = new Set(calibrationQuestions
      .filter((item) => dimensionSet.has(item.dimension) && dimensionSet.has(item.secondaryDimension))
      .map((item) => pairKey(item.dimension, item.secondaryDimension)));
    if (actualCalibrationPairs.size !== expectedCalibrationPairs.size
      || [...expectedCalibrationPairs].some((key) => !actualCalibrationPairs.has(key))) {
      errors.push({ code: 'portrait-calibration-pairs', message: '校准题必须覆盖五个维度的全部十种两两组合。' });
    }
    calibrationQuestions.forEach((item, index) => {
      if (!dimensionSet.has(item.dimension) || !dimensionSet.has(item.secondaryDimension)) return;
      const differences = (Array.isArray(item.options) ? item.options : []).map((option) => {
        const weights = option && option.weights ? option.weights : {};
        return Number(weights[item.dimension] || 0) - Number(weights[item.secondaryDimension] || 0);
      });
      if (!differences.some((value) => value > 0) || !differences.some((value) => value < 0)) {
        errors.push({
          code: 'portrait-calibration-discriminator',
          message: `${item.id || `校准题 ${index + 1}`} 不能有效区分两个维度。`,
          path: `portraitQuestions[${questions.indexOf(item)}].options`,
        });
      }
    });

    const typeIds = new Set();
    if (portraitTypes.length !== 15) errors.push({ code: 'portrait-type-count', message: '必须定义 15 种画像。' });
    portraitTypes.forEach((portrait, index) => {
      const path = `portraitTypes[${index}]`;
      if (!hasText(portrait && portrait.id) || typeIds.has(portrait.id)) errors.push({ code: 'portrait-type-id', message: '画像 ID 必须唯一。', path: `${path}.id` });
      else typeIds.add(portrait.id);
      const dimensions = Array.isArray(portrait && portrait.dimensions) ? portrait.dimensions : [];
      if (dimensions.length < 1 || dimensions.length > 2 || dimensions.some((dimension) => !dimensionSet.has(dimension))) errors.push({ code: 'portrait-type-dimensions', message: `${portrait && portrait.id ? portrait.id : path} 缺少有效维度。`, path: `${path}.dimensions` });
      ['title', 'coreDescription', 'strength', 'blindSpot'].forEach((field) => {
        if (!hasText(portrait && portrait[field])) errors.push({ code: 'portrait-type-field', message: `${portrait && portrait.id ? portrait.id : path} 缺少 ${field}。`, path: `${path}.${field}` });
      });
      if (!Array.isArray(portrait && portrait.theoryLinks) || portrait.theoryLinks.length === 0) errors.push({ code: 'portrait-type-theory', message: `${portrait && portrait.id ? portrait.id : path} 缺少理论连接。`, path: `${path}.theoryLinks` });
      else portrait.theoryLinks.forEach((theoryId) => {
        if (!theoryIds.has(theoryId)) errors.push({ code: 'portrait-unknown-theory', message: `${portrait.id || path} 引用了不存在的理论单元。`, path: `${path}.theoryLinks` });
      });
    });

    const analysisTextFields = [
      'plainReading',
      'conditions',
      'mainContradiction',
      'practiceAnalysis',
      'subjectAnalysis',
      'developmentAnalysis',
      'misunderstanding',
      'practiceExercise',
    ];
    const analysisIds = new Set();
    if (portraitAnalyses.length !== 15) {
      errors.push({ code: 'portrait-analysis-count', message: '画像深度分析必须为 15 种。' });
    }
    portraitAnalyses.forEach((analysis, index) => {
      const path = `portraitAnalyses[${index}]`;
      if (!hasText(analysis && analysis.portraitId) || analysisIds.has(analysis.portraitId)) {
        errors.push({ code: 'portrait-analysis-id', message: '画像深度分析 ID 必须唯一。', path: `${path}.portraitId` });
      } else {
        analysisIds.add(analysis.portraitId);
      }
      analysisTextFields.forEach((field) => {
        if (!hasText(analysis && analysis[field])) {
          errors.push({ code: 'portrait-analysis-field', message: `${analysis && analysis.portraitId ? analysis.portraitId : path} 缺少 ${field}。`, path: `${path}.${field}` });
        }
      });
      const links = Array.isArray(analysis && analysis.theoryLinks) ? analysis.theoryLinks : [];
      if (links.length < 2 || links.some((theoryId) => !theoryIds.has(theoryId))) {
        errors.push({ code: 'portrait-analysis-theory', message: `${analysis && analysis.portraitId ? analysis.portraitId : path} 缺少可解析的理论链接。`, path: `${path}.theoryLinks` });
      }
    });
    if ([...typeIds].some((id) => !analysisIds.has(id)) || [...analysisIds].some((id) => !typeIds.has(id))) {
      errors.push({ code: 'portrait-analysis-coverage', message: '画像深度分析必须与 15 种画像一一对应。' });
    }

    const guidanceDimensions = new Set();
    guidanceUnits.forEach((unit, index) => {
      const path = `guidanceUnits[${index}]`;
      if (!unit || !dimensionSet.has(unit.dimension)) errors.push({ code: 'guidance-dimension', message: '指导单元使用了未知维度。', path: `${path}.dimension` });
      else guidanceDimensions.add(unit.dimension);
      ['low', 'high'].forEach((branchName) => {
        ['punchline', 'anchor', 'explanation', 'exercise', 'followUp'].forEach((field) => {
          if (!hasText(unit && unit[branchName] && unit[branchName][field])) errors.push({ code: 'guidance-field', message: `${unit && unit.dimension ? unit.dimension : path} 缺少 ${branchName}.${field}。`, path: `${path}.${branchName}.${field}` });
        });
      });
    });
    PORTRAIT_DIMENSIONS.forEach((dimension) => {
      if (!guidanceDimensions.has(dimension)) errors.push({ code: 'guidance-coverage', message: `${dimension} 缺少指导单元。` });
    });

    return { valid: errors.length === 0, errors };
  }

  return { validateContent, validatePortraitContent };
});
