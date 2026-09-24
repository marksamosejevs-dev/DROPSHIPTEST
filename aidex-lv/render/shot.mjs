// Usage: node render/shot.mjs <url-path> <width> <out> [full] [height]
import { chromium } from 'playwright-core';
const [,, p = '/lv/', w = '1440', out = 'shot.png', full = '0', h = '900'] = process.argv;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
await page.goto((process.env.BASE || 'http://localhost:4321') + p, { waitUntil: 'networkidle' });
if (process.env.CONSENT) await page.evaluate(() => { localStorage.setItem('aidex_consent', JSON.stringify({ v: 1, necessary: true, analytics: false, marketing: false, ts: new Date().toISOString() })); });
if (process.env.CONSENT) await page.reload({ waitUntil: 'networkidle' });
// reveal everything
await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));
if (process.env.SCROLL) { await page.evaluate((y) => window.scrollTo(0, +y), process.env.SCROLL); await page.waitForTimeout(600); }
if (full === '1') { await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); }); await page.waitForLoadState('networkidle'); }
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: full === '1' });
const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
if (ov > 0) console.log('HORIZONTAL OVERFLOW', ov);
await browser.close();
