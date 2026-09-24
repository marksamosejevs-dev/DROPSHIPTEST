import { chromium } from 'playwright-core';
const B = 'http://localhost:4321';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const errors = [];
async function newPage(w = 1440, h = 900) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && !/status of 500/.test(m.text()) && errors.push(m.text())); // the 500 is the simulated backend failure
  return p;
}
// ---- cookie consent
let p = await newPage();
const reqs = [];
p.on('request', (r) => reqs.push(r.url()));
await p.goto(B + '/lv/', { waitUntil: 'networkidle' });
ok(await p.isVisible('[data-cc-banner]'), 'banner visible on first visit');
ok(!reqs.some((u) => /googletagmanager|facebook/.test(u)), 'no tracking requests before consent');
await p.click('[data-cc-banner] [data-cc="reject"]');
ok(await p.isHidden('[data-cc-banner]'), 'banner hidden after reject');
let c = await p.evaluate(() => JSON.parse(localStorage.getItem('aidex_consent')));
ok(c && c.analytics === false && c.marketing === false, 'reject stored');
ok((await p.context().cookies()).some((k) => k.name === 'aidex_consent'), 'consent cookie set');
await p.reload({ waitUntil: 'networkidle' });
ok(await p.isHidden('[data-cc-banner]'), 'banner not shown again after choice');
await p.click('footer [data-cookie-settings]');
ok(await p.isVisible('[data-cc-prefs]'), 'prefs dialog reopens from footer');
await p.check('#cc-analytics', { force: true });
await p.click('[data-cc-prefs] [data-cc="save"]');
c = await p.evaluate(() => JSON.parse(localStorage.getItem('aidex_consent')));
ok(c.analytics === true && c.marketing === false, 'granular save works');
await p.context().addCookies([{ name: '_ga', value: 'x', url: B }]);
await p.click('footer [data-cookie-settings]');
await p.uncheck('#cc-analytics', { force: true });
await p.click('[data-cc-prefs] [data-cc="save"]');
await p.waitForTimeout(500);
c = await p.evaluate(() => JSON.parse(localStorage.getItem('aidex_consent')));
ok(c.analytics === false, 'withdrawal stored');
ok(!(await p.context().cookies()).some((k) => k.name === '_ga'), 'analytics cookie deleted on withdrawal');
// manage from banner (fresh)
p = await newPage();
await p.goto(B + '/en/', { waitUntil: 'networkidle' });
await p.click('[data-cc-banner] [data-cc="manage"]');
ok(await p.isVisible('[data-cc-prefs]'), 'manage opens prefs');
ok(!(await p.isChecked('#cc-analytics')) && !(await p.isChecked('#cc-marketing')), 'categories unticked by default');
await p.click('[data-cc-prefs] [data-cc="accept"]');
c = await p.evaluate(() => JSON.parse(localStorage.getItem('aidex_consent')));
ok(c.analytics && c.marketing, 'accept all from prefs');

// ---- package toggle
await p.goto(B + '/lv/', { waitUntil: 'networkidle' });
const vis = async () => p.locator('.pc--featured .pc__price:visible .pc__net').innerText();
const before = await vis();
await p.click('[data-mode-btn="without"]');
const after = await vis();
ok(before !== after, `package toggle changes price (${before.replace(/\s+/g,' ')} → ${after.replace(/\s+/g,' ')})`);

// ---- hotspots + day/night + kW selector
await p.click('[data-pin="battery"]');
ok(await p.isVisible('[data-info="battery"]') && await p.isHidden('[data-info="panels"]'), 'hotspot switches info card');
await p.click('[data-dn="night"]');
ok((await p.getAttribute('[data-daynight]', 'data-mode')) === 'night', 'day/night toggles');
const prod1 = await p.locator('[data-s="production"]').innerText();
await p.click('[data-kw="12"]');
ok(prod1 !== await p.locator('[data-s="production"]').innerText(), 'kW selector updates stats');

// ---- calculator
const kw1 = await p.locator('[data-out="kw"]').innerText();
await p.fill('#calc-kwh', '1200');
await p.dispatchEvent('#calc-kwh', 'input');
const kw2 = await p.locator('[data-out="kw"]').innerText();
ok(kw1 !== kw2, `calculator updates (${kw1} → ${kw2} kW)`);
await p.check('input[name="mode"][value="bill"]', { force: true });
ok(await p.isVisible('#calc-bill'), 'bill mode shows bill input');
await p.uncheck('input[name="battery"]', { force: true });
ok((await p.locator('[data-out="battery"]').innerText()).includes('Nav'), 'battery off → not included');

// ---- lead form
await p.goto(B + '/lv/sanemt-piedavajumu/?package=home-8&battery=1&kwh=700', { waitUntil: 'networkidle' });
const f = p.locator('#lead-offer');
await f.locator('[data-next]').click();
ok((await f.locator('[data-error-for="address"]').innerText()).length > 0, 'step1 empty address → error');
await f.locator('[name="address"]').fill('Mārupe');
await f.locator('[data-next]').click();
ok(await f.locator('[data-step-panel="2"]').isVisible(), 'advance to step 2');
ok((await f.locator('[name="usage"]').inputValue()) === '700', 'usage prefilled from URL');
await f.locator('[data-next]').click();
ok(await f.locator('[data-step-panel="3"]').isVisible(), 'advance to step 3');
ok(await f.locator('[data-prefill-interest="battery"]').isChecked(), 'battery interest prefilled');
await f.locator('[data-next]').click();
await f.locator('[name="phone"]').fill('12');
await f.locator('[name="email"]').fill('bad');
await f.locator('[data-submit]').click();
ok((await f.locator('[data-error-for="name"]').innerText()).length > 0 && (await f.locator('[data-error-for="phone"]').innerText()).length > 0 && (await f.locator('[data-error-for="email"]').innerText()).length > 0, 'step4 validation errors');
await f.locator('[name="name"]').fill('Test');
await f.locator('[name="phone"]').fill('+371 20000000');
await f.locator('[name="email"]').fill('test@example.com');
await f.locator('[data-submit]').click();
await p.waitForTimeout(900);
ok(!(await f.locator('[data-done]').isVisible()) && await f.locator('[data-not-connected]').isVisible(), 'no destination → honest "not connected", no fake success');
ok((await f.locator('[name="name"]').inputValue()) === 'Test', 'input kept after unsent submit');
// simulate a configured webhook: failure must NOT show success, 2xx must
const hook = 'https://leads.example.test/hook';
await f.evaluate((el, h) => { el.dataset.leads = JSON.stringify({ provider: 'webhook', endpoint: h, accessKey: '', portalId: '', formGuid: '', subject: '', timeoutMs: 4000 }); }, hook);
await p.route(hook, (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false}' }));
await f.locator('[data-submit]').click();
await p.waitForTimeout(500);
ok(!(await f.locator('[data-done]').isVisible()) && (await f.locator('[data-submit-error]').innerText()).length > 0, 'backend 500 → error, no success');
await p.unroute(hook);
let received = null;
await p.route(hook, (r) => { received = JSON.parse(r.request().postData()); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
await f.locator('[data-submit]').click();
await p.waitForTimeout(500);
ok(await f.locator('[data-done]').isVisible() && received?.email === 'test@example.com' && received?.package === 'home-8', 'backend 200 → success with payload');
ok(await f.locator('.lf__privacy a').getAttribute('href') === '/lv/privatuma-politika/', 'privacy link localized');

// ---- mobile menu + language
p = await newPage(390, 844);
await p.goto(B + '/ru/akkumulyatory/', { waitUntil: 'networkidle' });
await p.click('[data-menu-open]');
ok(await p.isVisible('[data-menu]'), 'mobile menu opens');
const langs = await p.$$eval('.mm__lang a', (as) => as.map((a) => a.getAttribute('href')));
ok(JSON.stringify(langs) === JSON.stringify(['/lv/akumulatori/', '/ru/akkumulyatory/', '/en/batteries/']), 'language links map to same page ' + langs.join(','));
await p.keyboard.press('Escape');
ok(await p.isHidden('[data-menu]'), 'menu closes on Escape');
// hreflang/canonical
const head = await p.evaluate(() => ({ can: document.querySelector('link[rel=canonical]').href, alt: [...document.querySelectorAll('link[rel=alternate]')].map((l) => l.hreflang + '=' + l.href), lang: document.documentElement.lang }));
ok(head.can === 'https://aidex.lv/ru/akkumulyatory/' && head.alt.length === 4 && head.lang === 'ru', 'canonical + 4 hreflang + html lang');
console.log(head.alt.join('\n'));
ok(errors.length === 0, 'no JS errors ' + errors.join(' | '));
await browser.close();
