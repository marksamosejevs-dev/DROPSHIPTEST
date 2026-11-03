// Broken-link / missing-asset check over the built site (default: ./dist).
// Checks every internal href/src/srcset (incl. #anchors) in every HTML page.
// Usage: node render/linkcheck.mjs [distDir]
import fs from 'fs';
import path from 'path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p); } })(dist);

const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...fs.readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};
const resolveFile = (url) => {
  const clean = decodeURIComponent(url.split(/[?#]/)[0]);
  const p = path.join(dist, clean);
  if (clean.endsWith('/')) return fs.existsSync(path.join(p, 'index.html')) ? path.join(p, 'index.html') : null;
  return fs.existsSync(p) && fs.statSync(p).isFile() ? p : null;
};

const broken = [];
let checked = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const rel = '/' + path.relative(dist, page).replace(/index\.html$/, '');
  const urls = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((x) => x.trim().split(/\s+/)[0])),
  ];
  for (const raw of urls) {
    const u = raw.replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(u) || u === '') continue;
    checked++;
    if (u.startsWith('#')) { if (u.length > 1 && !idsOf(page).has(u.slice(1))) broken.push(`${rel} → ${u} (missing anchor)`); continue; }
    const abs = u.startsWith('/') ? u : path.posix.join(rel, u);
    const file = resolveFile(abs);
    if (!file) { broken.push(`${rel} → ${u}`); continue; }
    const hash = u.split('#')[1];
    if (hash && file.endsWith('.html') && !idsOf(file).has(hash)) broken.push(`${rel} → ${u} (missing anchor)`);
  }
}
console.log(`${pages.length} pages · ${checked} internal links/assets checked`);
if (broken.length) { console.log('BROKEN:\n' + [...new Set(broken)].join('\n')); process.exit(1); }
console.log('NO BROKEN LINKS');
