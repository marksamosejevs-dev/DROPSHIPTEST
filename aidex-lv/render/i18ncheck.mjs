import { chromium } from 'playwright-core';
import { readdirSync, statSync } from 'fs';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = d + '/' + f; return statSync(p).isDirectory() ? walk(p) : p.endsWith('index.html') ? [p] : []; });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage();
for (const lang of ['en', 'ru']) {
  for (const f of walk('dist/' + lang)) {
    const url = 'http://localhost:4321' + f.slice(4).replace('index.html', '');
    await pg.goto(url);
    const bad = await pg.evaluate((lang) => {
      const out = new Set();
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) {
        const t = n.textContent.trim(); if (!t) continue;
        const el = n.parentElement; if (el.closest('script,style,[lang]:not(html)')) continue;
        if (/[āēīūčšžņļģķ]/i.test(t)) out.add(t.slice(0, 80));
        if (lang === 'ru' && /\b[a-z]{4,}\b/.test(t) && !/(AIDEX|GREEN|ENERGY|Group|Growatt|Renon|Xcellent|Plus|Hybrid|AIKO|black|kWh|Google|Meta|Pixel|Analytics|Consent|Mode|localStorage|cookie|Home|Max|aidex|energy|sadalestikls|www|dvi|ptac|gov|com|Ireland|Platforms|Ltd|UTM|HTTPS|GDPR|BESS|B2B|CRM|IT)/.test(t)) out.add('LATIN: ' + t.slice(0, 80));
      }
      return [...out];
    }, lang);
    if (bad.length) console.log(url, bad.slice(0, 6));
  }
}
await b.close();
