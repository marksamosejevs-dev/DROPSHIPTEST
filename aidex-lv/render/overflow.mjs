import { chromium } from 'playwright-core';
const [,, p = '/en/', w = '768'] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage({ viewport: { width: +w, height: 900 } });
await pg.goto('http://localhost:4321' + p, { waitUntil: 'networkidle' }); await pg.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'))); await pg.waitForTimeout(1200); console.log('sw', await pg.evaluate(() => document.documentElement.scrollWidth));
const r = await pg.evaluate(() => {
  const W = document.documentElement.clientWidth; const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const rc = el.getBoundingClientRect();
    if (rc.right > W + 1 && rc.width > 0) {
      let hidden = false; let e = el.parentElement;
      while (e) { const s = getComputedStyle(e); if (s.overflowX !== 'visible' && e !== document.body && e !== document.documentElement) { hidden = true; break; } e = e.parentElement; }
      if (!hidden) out.push(`${el.tagName}.${[...el.classList].join('.')} right=${Math.round(rc.right)} w=${Math.round(rc.width)}`);
    }
  });
  return out.slice(0, 15);
});
console.log(r.join('\n'));
await b.close();
