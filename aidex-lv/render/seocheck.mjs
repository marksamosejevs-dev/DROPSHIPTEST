// SEO check over dist/: title, description, canonical, hreflang, OG, single H1, html lang, sitemap coverage.
import fs from 'fs'; import path from 'path';
const dist = path.resolve(process.argv[2] ?? 'dist');
const pages = []; (function w(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? w(p) : f === 'index.html' && pages.push(p); } })(dist);
const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const issues = []; const titles = new Map();
for (const p of pages) {
  const h = fs.readFileSync(p, 'utf8'); const rel = '/' + path.relative(dist, p).replace(/index\.html$/, '');
  if (rel === '/') continue; // root is redirected to /lv/ by Netlify
  const g = (re) => (h.match(re) || [])[1];
  const title = g(/<title>([^<]*)<\/title>/), desc = g(/<meta name="description" content="([^"]*)"/), can = g(/<link rel="canonical" href="([^"]*)"/);
  const robots = g(/<meta name="robots" content="([^"]*)"/) || '';
  if (!title) issues.push(`${rel}: no title`); else titles.set(title, [...(titles.get(title) || []), rel]);
  if (!desc || desc.length < 50) issues.push(`${rel}: description missing/short`);
  if (can !== 'https://aidex.lv' + rel) issues.push(`${rel}: canonical ${can}`);
  if ((h.match(/<link rel="alternate" hreflang=/g) || []).length !== 4) issues.push(`${rel}: hreflang count`);
  if (!/property="og:title"/.test(h) || !/property="og:image"/.test(h)) issues.push(`${rel}: OG tags`);
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) issues.push(`${rel}: h1 count ${(h.match(/<h1[\s>]/g) || []).length}`);
  if (!/<html lang="(lv|ru|en)/.test(h)) issues.push(`${rel}: html lang`);
  if (!robots.includes('noindex') && !sitemap.includes(`https://aidex.lv${rel}<`)) issues.push(`${rel}: not in sitemap`);
}
for (const [t, r] of titles) if (r.length > 1) issues.push(`duplicate title "${t}": ${r.join(', ')}`);
console.log(`${pages.length} pages checked`); console.log(issues.length ? 'ISSUES:\n' + issues.join('\n') : 'SEO CLEAN'); if (issues.length) process.exitCode = 1;
