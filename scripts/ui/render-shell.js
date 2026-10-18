(function exposeShellRenderer(root, factory) {
  const portraitQuestionUi = typeof module === 'object' && module.exports
    ? require('./render-portrait-question.js')
    : root.AIThinkingPortraitQuestionUI;
  const portraitReportUi = typeof module === 'object' && module.exports
    ? require('./render-portrait-report.js')
    : root.AIThinkingPortraitReportUI;
  const stateApi = typeof module === 'object' && module.exports
    ? require('../core/state-machine.js')
    : root.AIThinkingState;
  const portraitEngine = typeof module === 'object' && module.exports
    ? require('../core/portrait-engine.js')
    : root.AIThinkingPortraitEngine;
  const guidanceEngine = typeof module === 'object' && module.exports
    ? require('../core/guidance-engine.js')
    : root.AIThinkingGuidanceEngine;
  const api = factory(portraitQuestionUi, portraitReportUi, stateApi, portraitEngine, guidanceEngine);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AIThinkingUI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createShellRenderer(portraitQuestionUi, portraitReportUi, stateApi, portraitEngine, guidanceEngine) {
  function renderComplete(state, data) {
    const basePortrait = portraitEngine.buildPortraitResult({
      answers: state.answers,
      questions: data.portraitQuestions || [],
      portraitTypes: data.portraitTypes || [],
    });
    const analysis = (data.portraitAnalyses || [])
      .find((item) => item.portraitId === (basePortrait.type && basePortrait.type.id)) || {};
    const theoryIds = Array.isArray(analysis.theoryLinks) ? analysis.theoryLinks : [];
    const theoryMap = new Map((data.theoryUnits || []).map((unit) => [unit.id, unit]));
    const portrait = {
      ...basePortrait,
      theoryConnections: theoryIds.map((id) => theoryMap.get(id)).filter(Boolean),
    };
    const guidance = guidanceEngine.buildGuidance({
      portrait,
      answers: state.answers,
      questions: data.portraitQuestions || [],
      guidanceUnits: data.guidanceUnits || [],
    });
    return portraitReportUi.renderPortraitReport(portrait, guidance, analysis);
  }

  function findQuestion(state, data) {
    const ids = state.phase === 'base' ? state.baseQuestionIds : state.calibrationQuestionIds;
    const id = ids[state.currentIndex];
    return (data.portraitQuestions || []).find((question) => question.id === id) || null;
  }

  function renderApp(rootElement, state, data = {}) {
    if (!rootElement) return '';
    let html = '';
    if (!state || state.phase === 'intro') {
      html = portraitQuestionUi.renderPortraitIntro();
    } else if (state.phase === 'base' || state.phase === 'calibration') {
      const question = findQuestion(state, data);
      const progress = stateApi.deriveProgress(state);
      const baseOffset = state.phase === 'calibration' ? state.baseQuestionIds.length : 0;
      html = portraitQuestionUi.renderPortraitQuestion(question, {
        selectedOptionId: question ? state.answers[question.id] : null,
        current: baseOffset + state.currentIndex + 1,
        total: progress.total,
        answered: progress.answered,
        phase: state.phase,
        errorCode: state.errorCode,
      });
    } else if (state.phase === 'calibration-select') {
      html = portraitQuestionUi.renderCalibrationTransition();
    } else if (state.phase === 'complete') {
      html = renderComplete(state, data);
    } else {
      html = '<section class="portrait-test-stage error-panel" role="alert"><h1>测试状态无法识别</h1><button type="button" data-action="reset">重新开始</button></section>';
    }

    if (state && state.phase !== 'intro' && data.resumeNotice) {
      html = `<p class="resume-notice" role="status">已恢复你上次的实验进度。</p>${html}`;
    }
    if (data.storageNotice) {
      html = `<p class="resume-notice storage-notice" role="status">${portraitQuestionUi.escapeHtml(data.storageNotice)}</p>${html}`;
    }
    rootElement.innerHTML = html;
    return html;
  }

  return {
    renderApp,
    renderIntro: portraitQuestionUi.renderPortraitIntro,
    renderPortraitIntro: portraitQuestionUi.renderPortraitIntro,
    renderPortraitQuestion: portraitQuestionUi.renderPortraitQuestion,
    renderCalibrationTransition: portraitQuestionUi.renderCalibrationTransition,
    renderPortraitReport: portraitReportUi.renderPortraitReport,
  };
});
