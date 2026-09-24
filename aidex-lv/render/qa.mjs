// Full-site QA: overflow at 4 widths, broken internal links/assets, canonical + hreflang
// reciprocity, one <h1>, unique titles/descriptions.  Usage: node render/qa.mjs [distDir] [base]
import { chromium } from 'playwright-core';
import { readdirSync, statSync, existsSync, readFileSync } from 'fs';
const [,, dist = 'dist', base = 'http://localhost:4321'] = process.argv;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = d + '/' + f; return statSync(p).isDirectory() ? walk(p) : p.endsWith('index.html') ? [p] : []; });
const pages = ['lv', 'ru', 'en'].flatMap((l) => walk(`${dist}/${l}`)).map((f) => f.slice(dist.length).replace('index.html', ''));
const SITE = 'https://aidex.lv';
const problems = [];
const exists = (u) => { const p = decodeURI(u.split('#')[0].split('?')[0]); const f = dist + p + (p.endsWith('/') ? 'index.html' : ''); return existsSync(f); };
const titles = {}, descs = {};
// ---- static checks
for (const pg of pages) {
  const html = readFileSync(dist + pg + 'index.html', 'utf8');
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canon !== SITE + pg) problems.push(`${pg}: canonical ${canon}`);
  const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]);
  if (alts.length !== 4) problems.push(`${pg}: ${alts.length} hreflang`);
  for (const [hl, href] of alts) {
    const p = href.replace(SITE, '');
    if (!exists(p)) problems.push(`${pg}: hreflang ${hl} → missing ${p}`);
    else if (hl !== 'x-default') {
      const other = readFileSync(dist + p + 'index.html', 'utf8');
      if (!other.includes(`href="${SITE + pg}"`)) problems.push(`${pg}: hreflang ${hl} not reciprocal`);
    }
  }
  const lang = html.match(/<html lang="([^"]+)"/)?.[1];
  if (lang !== pg.split('/')[1]) problems.push(`${pg}: html lang ${lang}`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${pg}: ${h1} <h1>`);
  const t = html.match(/<title>([^<]*)<\/title>/)?.[1]; const d = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  (titles[t] ??= []).push(pg); (descs[d] ??= []).push(pg);
  if (/\{group|\{price|\{kwh|undefined|NaN|\[object/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) problems.push(`${pg}: unresolved token / undefined in HTML`);
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) if (!m[1].startsWith('//') && !exists(m[1])) problems.push(`${pg}: broken link ${m[1]}`);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(' ')[0]; if (u.startsWith('/') && !exists(u)) problems.push(`${pg}: broken srcset ${u}`); }
}
for (const [t, ps] of Object.entries(titles)) if (ps.length > 1) problems.push(`duplicate title "${t}": ${ps.join(', ')}`);
for (const [d, ps] of Object.entries(descs)) if (ps.length > 1) problems.push(`duplicate description: ${ps.join(', ')}`);
// ---- rendered overflow
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let checks = 0;
for (const w of [1440, 1280, 768, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  for (const pg of pages) {
    await p.goto(base + pg, { waitUntil: 'load' });
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    checks++;
    if (ov > 0) problems.push(`${pg} @${w}: horizontal overflow ${ov}px`);
  }
  await ctx.close();
}
await b.close();
console.log(`${pages.length} pages · ${checks} overflow checks`);
console.log(problems.length ? problems.join('\n') : 'ALL CLEAN');
