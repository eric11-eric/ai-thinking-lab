(() => {
  function setupReport(root) {
    const chapters = [...root.querySelectorAll('[data-report-chapter]')];
    const links = [...root.querySelectorAll('.report-toc a[href^="#"]')];
    const progress = root.querySelector('[data-report-progress]');
    if (chapters.length !== 5 || !progress) return;

    function showChapter(initial = false) {
      const requested = decodeURIComponent(location.hash.slice(1));
      const all = requested === 'all';
      const requestedIndex = chapters.findIndex((chapter) => chapter.id === requested);
      const index = requestedIndex < 0 ? 0 : requestedIndex;
      const current = chapters[index];

      chapters.forEach((chapter, chapterIndex) => {
        chapter.hidden = !all && chapterIndex !== index;
      });
      links.forEach((link) => {
        const active = link.getAttribute('href') === (all ? '#all' : `#${current.id}`);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      progress.textContent = all ? '完整报告' : `第 ${index + 1} 章，共 ${chapters.length} 章`;
      root.classList.add('report-enhanced');

      if (initial && !location.hash) return;
      const target = all ? root.querySelector('.report-reading') : current;
      requestAnimationFrame(() => {
        target?.scrollIntoView({ block: 'start', behavior: 'auto' });
        if (!initial && !all) {
          const heading = current.querySelector('h2');
          if (heading) {
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
          }
        }
      });
    }

    window.addEventListener('hashchange', () => showChapter());
    showChapter(true);
  }

  function start() {
    document.querySelectorAll('[data-report-reader]').forEach(setupReport);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
