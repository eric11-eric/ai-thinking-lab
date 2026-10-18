(function startApplication(root) {
  const data = root.AIThinkingData || {};
  const rootElement = document.getElementById('app');
  const knowledgeRoot = document.getElementById('knowledge-root');
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const navigation = root.AIThinkingNavigation;
  const storageKey = 'ai-thinking-lab-progress';
  const questions = Array.isArray(data.portraitQuestions) ? data.portraitQuestions : [];
  const baseQuestions = questions.filter((item) => item.phase === 'base').sort((a, b) => a.order - b.order);
  const calibrationQuestions = questions.filter((item) => item.phase === 'calibration');
  const questionById = new Map(questions.map((item) => [item.id, item]));
  const ids = {
    baseQuestionIds: baseQuestions.map((item) => item.id),
    calibrationPoolIds: calibrationQuestions.map((item) => item.id),
  };
  const contentValidation = root.AIThinkingContent.validateContent(data);
  const portraitValidation = root.AIThinkingContent.validatePortraitContent(data);

  if (!contentValidation.valid || !portraitValidation.valid) {
    rootElement.innerHTML = '<section class="error-panel" role="alert"><h1>内容资料未通过校验</h1><p>请检查本地题库、画像和资料文件是否完整。</p></section>';
    return;
  }

  let browserStorage = null;
  try {
    browserStorage = root.localStorage;
  } catch (error) {
    browserStorage = null;
  }
  const restored = root.AIThinkingStorage.loadProgress(browserStorage, storageKey);
  let state = restored.status === 'ok'
    ? restored.state
    : root.AIThinkingState.createInitialState(ids);
  const atlasStateApi = root.AIThinkingPortraitAtlasState;
  let atlasState = atlasStateApi.createAtlasState(data.portraitTypes || []);
  atlasState = atlasStateApi.syncOwnPortrait(
    atlasState,
    atlasStateApi.deriveOwnPortraitId(state, data),
    data.portraitTypes || [],
  );
  let transitionTimer = null;
  let answerPending = false;
  let calibrationPending = false;

  data.resumeNotice = restored.status === 'ok' && state.phase !== 'intro';
  data.storageNotice = restored.status === 'unavailable'
    ? '当前浏览器无法保存进度，本页内仍可继续。'
    : (restored.status === 'corrupt' || restored.status === 'version-mismatch'
      ? '检测到无法继续使用的旧记录，已从新测试开始。'
      : '');
  data.dismissStorageNoticeOnAction = restored.status === 'corrupt' || restored.status === 'version-mismatch';
  if (data.dismissStorageNoticeOnAction) root.AIThinkingStorage.clearProgress(browserStorage, storageKey);

  function prefersReducedMotion() {
    return typeof root.matchMedia === 'function'
      && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function clearTransition() {
    if (transitionTimer !== null) root.clearTimeout(transitionTimer);
    transitionTimer = null;
    answerPending = false;
  }

  function moveToElement(target, focus = true) {
    if (!target) return;
    root.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
      if (focus && typeof target.focus === 'function') target.focus({ preventScroll: true });
    });
  }

  function focusActivePanel() {
    const panel = rootElement.querySelector('.portrait-test-stage, #report');
    moveToElement(panel || rootElement);
  }

  function scheduleCalibration() {
    if (state.phase !== 'calibration-select' || calibrationPending) return;
    calibrationPending = true;
    const run = () => {
      const selected = root.AIThinkingPortraitEngine.selectCalibrationQuestions(
        state.answers,
        questions,
        5,
      );
      calibrationPending = false;
      commit({ type: 'SET_CALIBRATION', questionIds: selected.map((item) => item.id || item) });
    };
    transitionTimer = root.setTimeout(run, prefersReducedMotion() ? 0 : 220);
  }

  function render({ focus = false } = {}) {
    root.AIThinkingUI.renderApp(rootElement, state, data);
    if (state.phase === 'calibration-select') scheduleCalibration();
    if (focus) focusActivePanel();
  }

  function commit(event, options = {}) {
    clearTransition();
    calibrationPending = false;
    if (data.dismissStorageNoticeOnAction) {
      data.storageNotice = '';
      data.dismissStorageNoticeOnAction = false;
    }
    state = root.AIThinkingState.reduceExperiment(state, event);
    const previousOwnId = atlasState.ownId;
    atlasState = atlasStateApi.syncOwnPortrait(
      atlasState,
      atlasStateApi.deriveOwnPortraitId(state, data),
      data.portraitTypes || [],
    );
    data.resumeNotice = false;
    const saved = root.AIThinkingStorage.saveProgress(browserStorage, storageKey, state);
    if (!saved.ok) data.storageNotice = '当前浏览器无法保存进度，本页内仍可继续。';
    render({ focus: options.focus !== false });
    if (atlasState.ownId !== previousOwnId) renderAtlasView();
  }

  function resetExperiment() {
    clearTransition();
    calibrationPending = false;
    data.dismissStorageNoticeOnAction = false;
    const cleared = root.AIThinkingStorage.clearProgress(browserStorage, storageKey);
    state = root.AIThinkingState.createInitialState(ids);
    atlasState = atlasStateApi.syncOwnPortrait(atlasState, '', data.portraitTypes || []);
    data.resumeNotice = false;
    data.storageNotice = cleared.ok ? '' : '当前浏览器无法清除已保存记录，但本页已重新开始。';
    render({ focus: true });
    renderAtlasView();
  }

  function renderAtlasView({ focus = false } = {}) {
    const markup = root.AIThinkingPortraitAtlasUI.renderPortraitAtlas(data, atlasState);
    const current = knowledgeRoot.querySelector('#portraits');
    if (current) current.outerHTML = markup;
    else knowledgeRoot.insertAdjacentHTML('afterbegin', markup);
    applyCurrentView();
    if (!focus) return;
    root.requestAnimationFrame(() => {
      const heading = knowledgeRoot.querySelector('#portrait-atlas-detail-title');
      if (heading && typeof heading.focus === 'function') heading.focus({ preventScroll: true });
    });
  }

  function applyCurrentView({ scroll = false } = {}) {
    const plan = navigation.createViewPlan(root.location.hash);
    rootElement.hidden = !plan.showExperiment;
    knowledgeRoot.hidden = plan.visibleKnowledgeViews.length === 0;
    const knowledgeSections = [...knowledgeRoot.querySelectorAll('[data-view]')];
    knowledgeSections.forEach((section) => {
      section.hidden = !plan.visibleKnowledgeViews.includes(section.dataset.view);
      section.classList.remove('is-view-start');
    });
    const firstVisibleSection = knowledgeSections.find((section) => !section.hidden);
    if (firstVisibleSection) firstVisibleSection.classList.add('is-view-start');
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${plan.view}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (!scroll) return;
    const rawHash = String(root.location.hash || '').replace(/^#/, '');
    const internalTarget = rawHash && !navigation.isViewHash(root.location.hash)
      ? document.getElementById(rawHash)
      : null;
    const viewTarget = plan.showExperiment
      ? rootElement
      : knowledgeRoot.querySelector(`[data-view="${plan.view}"]:not([hidden])`);
    moveToElement(internalTarget || viewTarget, false);
  }

  rootElement.addEventListener('click', (event) => {
    const control = event.target.closest('button, a');
    if (!control || !rootElement.contains(control)) return;

    if (control.dataset.action === 'portrait-start') {
      commit({ type: 'START' });
      return;
    }
    if (control.dataset.action === 'portrait-back') {
      clearTransition();
      commit({ type: 'GO_BACK' });
      return;
    }
    if (control.dataset.action === 'portrait-edit-last') {
      commit({ type: 'GO_BACK' });
      return;
    }
    if (control.dataset.action === 'reset') {
      resetExperiment();
      return;
    }
    if (control.dataset.action === 'print-report') {
      const printDetails = [...document.querySelectorAll('#report details, #theory-report details, #sources details')];
      const closedDetails = printDetails.filter((item) => !item.open);
      printDetails.forEach((item) => { item.open = true; });
      root.addEventListener('afterprint', () => {
        closedDetails.forEach((item) => { item.open = false; });
      }, { once: true });
      root.print();
      return;
    }

    if (!control.dataset.portraitOption || answerPending) return;
    const activeIds = state.phase === 'base' ? state.baseQuestionIds : state.calibrationQuestionIds;
    const questionId = activeIds[state.currentIndex];
    if (!questionById.has(questionId)) return;

    answerPending = true;
    [...rootElement.querySelectorAll('[data-portrait-option]')].forEach((button) => {
      const selected = button === control;
      button.setAttribute('aria-pressed', String(selected));
      button.disabled = true;
      button.classList.toggle('is-selected', selected);
    });
    transitionTimer = root.setTimeout(() => {
      commit({ type: 'ANSWER_QUESTION', questionId, optionId: control.dataset.portraitOption });
    }, prefersReducedMotion() ? 0 : 220);
  });

  rootElement.setAttribute('tabindex', '-1');
  render();

  let libraryFilter = 'all';
  knowledgeRoot.innerHTML = [
    root.AIThinkingPortraitAtlasUI.renderPortraitAtlas(data, atlasState),
    root.AIThinkingVisualizationUI.renderVisualizations(data),
    root.AIThinkingTheoryUI.renderTheoryReview({
      status: 'reference',
      theoryLinks: (data.theoryUnits || []).map((unit) => unit.id),
    }, data.theoryUnits || [], { reference: true, id: 'theory' }),
    root.AIThinkingLibraryUI.renderLibrary(data, libraryFilter),
    root.AIThinkingToolkitUI.renderToolkit(),
    root.AIThinkingLibraryUI.renderSourceDirectory(data),
  ].join('');

  root.addEventListener('hashchange', () => {
    applyCurrentView({ scroll: true });
  });

  document.querySelector('.site-header').addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const nextHash = link.getAttribute('href');
    if (!navigation.isViewHash(nextHash)) return;
    event.preventDefault();
    if (root.location.hash === nextHash) applyCurrentView({ scroll: true });
    else root.location.hash = nextHash;
  });

  knowledgeRoot.addEventListener('click', (event) => {
    const atlasControl = event.target.closest('[data-portrait-atlas-id]');
    if (atlasControl) {
      const nextAtlasState = atlasStateApi.selectAtlasPortrait(
        atlasState,
        atlasControl.dataset.portraitAtlasId,
        data.portraitTypes || [],
      );
      atlasState = nextAtlasState;
      renderAtlasView({ focus: true });
      return;
    }
    const control = event.target.closest('[data-library-filter]');
    if (!control) return;
    libraryFilter = control.dataset.libraryFilter;
    const currentLibrary = knowledgeRoot.querySelector('.library-section');
    if (currentLibrary) {
      currentLibrary.outerHTML = root.AIThinkingLibraryUI.renderLibrary(data, libraryFilter);
      applyCurrentView();
    }
  });

  knowledgeRoot.addEventListener('change', (event) => {
    if (!event.target.matches('[data-toolkit-check]')) return;
    const count = knowledgeRoot.querySelectorAll('[data-toolkit-check]:checked').length;
    const output = knowledgeRoot.querySelector('[data-toolkit-count]');
    if (output) output.textContent = String(count);
  });

  applyCurrentView({ scroll: Boolean(root.location.hash) });
})(window);
