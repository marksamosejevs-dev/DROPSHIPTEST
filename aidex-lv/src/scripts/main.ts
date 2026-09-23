/** Site-wide progressive enhancement: header, mobile menu, reveals, counters. */

// ---- Header state -----------------------------------------------------------
const header = document.querySelector<HTMLElement>('[data-header]');
const mcta = document.querySelector<HTMLElement>('[data-mobile-cta]');
let lastY = window.scrollY;
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('is-scrolled', y > 24);
  if (header) header.classList.toggle('is-hidden', y > 480 && y > lastY + 4 && !document.body.classList.contains('menu-open'));
  if (y < lastY - 4) header?.classList.remove('is-hidden');
  if (mcta) {
    const endZone = document.querySelector('[data-hide-mobile-cta]');
    let hide = false;
    if (endZone) {
      const r = endZone.getBoundingClientRect();
      hide = r.top < window.innerHeight && r.bottom > 0;
    }
    const show = y > window.innerHeight * 0.6 && !hide;
    mcta.classList.toggle('is-visible', show);
    mcta.setAttribute('aria-hidden', String(!show));
    mcta.querySelectorAll('a').forEach((a) => (show ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
  }
  lastY = y;
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
onScroll();

// ---- Mobile menu ------------------------------------------------------------
const menu = document.querySelector<HTMLElement>('[data-menu]');
const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
function setMenu(open: boolean) {
  if (!menu || !openBtn) return;
  menu.hidden = !open;
  menu.classList.toggle('is-open', open);
  openBtn.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  document.documentElement.style.overflow = open ? 'hidden' : '';
  (open ? closeBtn : openBtn)?.focus();
}
openBtn?.addEventListener('click', () => setMenu(true));
closeBtn?.addEventListener('click', () => setMenu(false));
menu?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
  if (e.key === 'Tab') {
    const f = menu.querySelectorAll<HTMLElement>('a[href], button');
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
matchMedia('(min-width: 1280px)').addEventListener('change', (e) => e.matches && setMenu(false));

// ---- Reveal on scroll -------------------------------------------------------
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io?.unobserve(en.target);
        if ((en.target as HTMLElement).dataset.count !== undefined) countUp(en.target as HTMLElement);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  : null;
document.querySelectorAll<HTMLElement>('[data-reveal], [data-count]').forEach((el) => {
  if (io) io.observe(el); else el.classList.add('is-in');
});

// ---- Number counters (format is preserved from the server-rendered value) --
function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  const final = el.textContent ?? '';
  if (reduce || !Number.isFinite(target) || target === 0) return;
  const fmt = new Intl.NumberFormat(document.documentElement.lang === 'en' ? 'en-IE' : document.documentElement.lang, { maximumFractionDigits: 0 });
  const prefix = el.dataset.prefix ?? '';
  const suffix = el.dataset.suffix ?? '';
  const t0 = performance.now(), dur = 1400;
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = p < 1 ? prefix + fmt.format(Math.round(target * eased)) + suffix : final;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export {};
