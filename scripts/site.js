document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.site-header nav');
  const current = nav?.querySelector('[aria-current="page"]');
  if (!nav || !current) return;
  const item = current.getBoundingClientRect();
  const viewport = nav.getBoundingClientRect();
  nav.scrollLeft += item.left - viewport.left - (nav.clientWidth - current.clientWidth) / 2;
});
