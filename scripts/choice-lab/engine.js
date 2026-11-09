(function attachChoiceLabEngine(root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  root.AIChoiceLabEngine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createChoiceLabEngine() {
  function validate(scenes) {
    const errors = [];
    if (!Array.isArray(scenes) || scenes.length !== 3) return ['expected three scenes'];
    const ids = new Set();
    const expected = ['work', 'study', 'relationship'];
    scenes.forEach((scene, sceneIndex) => {
      if (scene.id !== expected[sceneIndex]) errors.push(`unexpected scene ${scene?.id}`);
      for (const field of ['short', 'title', 'reportHref', 'principle', 'theory', 'check']) {
        if (typeof scene[field] !== 'string' || !scene[field].trim()) errors.push(`${scene.id}: missing ${field}`);
      }
      if (!Array.isArray(scene.questions) || scene.questions.length !== 4) {
        errors.push(`${scene.id}: expected four questions`);
        return;
      }
      scene.questions.forEach((question) => {
        if (!question.id || ids.has(question.id)) errors.push(`duplicate or missing question ID ${question.id}`);
        ids.add(question.id);
        if (!question.context || !question.prompt) errors.push(`${question.id}: missing context or prompt`);
        if (!Array.isArray(question.options) || question.options.length !== 3) {
          errors.push(`${question.id}: expected three options`);
          return;
        }
        const optionIds = new Set();
        question.options.forEach((option) => {
          if (!option.id || optionIds.has(option.id)) errors.push(`${question.id}: duplicate or missing option ID`);
          optionIds.add(option.id);
          for (const field of ['label', 'benefit', 'cost']) {
            if (typeof option[field] !== 'string' || !option[field].trim()) errors.push(`${question.id}/${option.id}: missing ${field}`);
          }
        });
      });
    });
    return errors;
  }

  function buildReport(scenes, answers) {
    if (validate(scenes).length) return null;
    const sceneReports = [];
    for (const scene of scenes) {
      const decisions = [];
      for (const question of scene.questions) {
        const option = question.options.find((entry) => entry.id === answers?.[question.id]);
        if (!option) return null;
        decisions.push({ questionId: question.id, context: question.context, prompt: question.prompt, option });
      }
      sceneReports.push({
        id: scene.id,
        short: scene.short,
        title: scene.title,
        principle: scene.principle,
        theory: scene.theory,
        check: scene.check,
        reportHref: scene.reportHref,
        decisions,
      });
    }
    return sceneReports;
  }

  return { validate, buildReport };
});
