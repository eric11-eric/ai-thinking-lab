(() => {
  const root = document.getElementById('test-root');
  const scenes = window.AIChoiceLabData?.scenes || [];
  const engine = window.AIChoiceLabEngine;
  const portraitEngine = window.AIChoiceLabPortraits;
  const questions = Array.isArray(scenes) ? scenes.flatMap((scene) => Array.isArray(scene.questions) ? scene.questions.map((question) => ({ ...question, scene })) : []) : [];
  const storageKey = 'marx-tech-choice-v4';
  if (!root || !engine || !portraitEngine || engine.validate(scenes).length) {
    if (root) root.innerHTML = '<section class="test-error"><h1>选择实验暂时无法打开</h1><p>请确认网页文件已完整复制，再刷新页面。</p></section>';
    return;
  }

  const escape = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const stored = (() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch { return {}; }
  })();
  let answers = Object.fromEntries(questions.flatMap((question) => {
    const answer = stored.answers?.[question.id];
    return question.options.some((option) => option.id === answer) ? [[question.id, answer]] : [];
  }));
  let index = questions.findIndex((question) => !answers[question.id]);
  if (index < 0) index = questions.length;
  let mode = Object.keys(answers).length === 0 ? 'intro' : index === questions.length ? 'result' : 'question';
  let activeSceneId = scenes[0].id;
  let switching = false;

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({ answers })); } catch {}
  }
  function topAndFocus() {
    requestAnimationFrame(() => {
      root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      root.querySelector('h1, h2')?.focus({ preventScroll: true });
    });
  }
  function renderIntro() {
    root.innerHTML = '<section class="test-intro wrap"><div><h1 tabindex="-1">如果 AI 来到这三件事里，你会怎么选？</h1><p>找工作、用 AI 完成作业、向 AI 倾诉：三个设想的现场，各有四次选择。每个办法都有好处，也有暂时顾不到的地方。选你此刻最可能采取的做法，最后得到一张属于这次选择的肖像，再看它与马原有什么关系。</p><p class="test-method">大约 4 分钟。没有标准答案，也不测人格；回答只保存在当前设备。</p><button class="primary-button" data-action="start">开始选择 <span aria-hidden="true">↗</span></button><a class="quiet-link" href="cases/work.html">先读三篇报告</a></div><div class="test-intro-art" aria-hidden="true">3<span>个现场</span></div></section>';
  }
  function renderQuestion() {
    const question = questions[index];
    if (!question) { mode = 'result'; renderResult(); return; }
    const sceneNumber = question.scene.questions.findIndex((entry) => entry.id === question.id) + 1;
    const answered = Object.keys(answers).length;
    root.innerHTML = '<section class="test-stage wrap"><div class="progress-line"><span>' + escape(question.scene.short) + ' · 第 ' + sceneNumber + ' / 4 题</span><span>总进度 ' + (index + 1) + ' / ' + questions.length + '</span></div><div class="progress-track"><span style="width:' + Math.max(3, answered / questions.length * 100) + '%"></span></div><div class="question-panel"><p class="question-context">' + escape(question.context) + '</p><h1 tabindex="-1">' + escape(question.prompt) + '</h1><div class="answer-list" role="group" aria-label="选出你最可能采用的做法">' + question.options.map((option, optionIndex) => '<button type="button" class="answer-option ' + (answers[question.id] === option.id ? 'is-selected' : '') + '" data-answer="' + escape(option.id) + '"><span class="option-letter">' + String.fromCharCode(65 + optionIndex) + '</span><span>' + escape(option.label) + '</span><span class="option-arrow" aria-hidden="true">↗</span></button>').join('') + '</div></div><div class="test-controls"><button type="button" class="plain-button" data-action="back" ' + (index === 0 ? 'disabled' : '') + '>← 上一题</button><button type="button" class="plain-button" data-action="restart">重新开始</button></div></section>';
  }
  function renderEvidence(decision) {
    return '<li><strong>' + escape(decision.prompt) + '</strong><p>你选择：“' + escape(decision.option.label) + '”。</p><p>' + escape(decision.option.benefit) + ' ' + escape(decision.option.cost) + '</p></li>';
  }
  function renderResult() {
    const reports = engine.buildReport(scenes, answers);
    const portraits = reports && portraitEngine.build(reports);
    if (!portraits) {
      root.innerHTML = '<section class="test-error"><h1>还没完成全部选择</h1><p>请返回题目继续完成。</p><button type="button" class="primary-button" data-action="start">继续选择</button></section>';
      return;
    }
    const active = portraits.find((portrait) => portrait.id === activeSceneId) || portraits[0];
    const sourceHref = active.id === 'work' ? 'sources.html#s5' : 'sources.html#s6';
    const sourceLinks = '<a href="' + sourceHref + '">查看原理出处 ↗</a>' + (active.id === 'relationship' ? '<a href="sources.html#s7">查看自由发展出处 ↗</a>' : '');
    root.innerHTML =
      '<div class="portrait-results">' +
      '<section class="portrait-hero"><div class="wrap"><p class="portrait-label">你的选择肖像</p><h1 tabindex="-1" aria-label="' + portraits.map((portrait) => escape(portrait.name)).join('、') + '">' +
      portraits.map((portrait) => '<span>' + escape(portrait.name) + '</span>').join('') +
      '</h1><p class="portrait-summary">你倾向' + portraits.map((portrait) => escape(portrait.hero)).join('；') + '。这些倾向来自这次回答，条件改变时，选择也可能改变。</p>' +
      '<p class="portrait-premise"><strong>马原提醒：</strong>技术增加了什么能力，还要看谁有机会运用它、在实践中检验它，并从中获得发展。</p></div></section>' +
      '<div class="wrap portrait-main"><nav class="lab-scene-tabs" aria-label="查看三个场景的选择肖像">' +
      portraits.map((portrait) => '<button type="button" data-scene="' + escape(portrait.id) + '" aria-pressed="' + (portrait.id === active.id) + '">' + escape(portrait.short) + '</button>').join('') +
      '</nav><article class="portrait-article"><h2 tabindex="-1">' + escape(active.short) + '里的你：' + escape(active.name) + '</h2>' +
      '<p class="portrait-lede">' + escape(active.summary) + '</p><p class="portrait-body">' + escape(active.gain) + ' ' + escape(active.risk) + '</p>' +
      '<section class="portrait-theory"><h3>马原怎么看：' + escape(active.principle) + '</h3><p>' + escape(active.marx) + '</p><p>放到现实中，还可以检验：' + escape(active.check) + '</p><details><summary>展开理论分析</summary><p>' + escape(active.theory) + '</p></details><div class="portrait-sources">' + sourceLinks + '</div></section>' +
      '<p class="portrait-extra">' + escape(active.extraText) + '</p><p class="portrait-pivot">' + escape(active.pivotText) + '</p>' +
      '<details class="portrait-evidence"><summary>这份解读怎么得出</summary><p>每个场景以一道最能体现取舍的题目定名，再用其他回答补充分析。这是一份教学互动的选择肖像，不是固定人格测量。</p><ol>' +
      active.decisions.map(renderEvidence).join('') + '</ol></details>' +
      '<div class="lab-actions"><a class="primary-link" href="' + escape(active.reportHref) + '">读完整案例 <span aria-hidden="true">↗</span></a><button type="button" class="plain-button" data-redo="' + escape(active.id) + '">重选这个现场</button><button type="button" class="plain-button" data-action="restart">全部重做</button></div>' +
      '</article></div></div>';
  }
  function render() {
    if (mode === 'intro') renderIntro();
    else if (mode === 'question') renderQuestion();
    else renderResult();
  }
  root.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action], [data-answer], [data-scene], [data-redo]');
    if (!target || switching) return;
    if (target.dataset.scene) {
      activeSceneId = target.dataset.scene;
      renderResult();
      root.querySelector('.portrait-article h2')?.focus({ preventScroll: true });
      return;
    }
    if (target.dataset.redo) {
      const scene = scenes.find((entry) => entry.id === target.dataset.redo);
      if (!scene) return;
      scene.questions.forEach((question) => { delete answers[question.id]; });
      activeSceneId = scene.id;
      index = questions.findIndex((question) => !answers[question.id]);
      mode = 'question';
      save(); render(); topAndFocus();
      return;
    }
    const action = target.dataset.action;
    if (action === 'start') {
      index = questions.findIndex((question) => !answers[question.id]);
      mode = index < 0 ? 'result' : 'question';
      render(); topAndFocus();
      return;
    }
    if (action === 'restart') {
      if (!confirm('重新开始会清除这次回答，确定继续吗？')) return;
      answers = {}; index = 0; mode = 'intro'; activeSceneId = scenes[0].id;
      save(); render(); topAndFocus();
      return;
    }
    if (action === 'back') {
      if (index > 0) { index -= 1; mode = 'question'; render(); topAndFocus(); }
      return;
    }
    const optionId = target.dataset.answer;
    if (!optionId) return;
    const question = questions[index];
    if (!question.options.some((option) => option.id === optionId)) return;
    const answeredIndex = index;
    answers[question.id] = optionId;
    save();
    target.classList.add('is-selected');
    switching = true;
    window.setTimeout(() => {
      switching = false;
      const firstUnanswered = questions.findIndex((entry) => !answers[entry.id]);
      if (firstUnanswered < 0) { index = questions.length; mode = 'result'; activeSceneId = question.scene.id; }
      else { index = Math.min(answeredIndex + 1, firstUnanswered); mode = 'question'; }
      render(); topAndFocus();
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 40 : 220);
  });
  render();
})();
