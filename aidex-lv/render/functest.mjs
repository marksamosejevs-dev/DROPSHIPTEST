import { chromium } from 'playwright-core';
const B = 'http://localhost:4321';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const errors = [];
async function newPage(w = 1440, h = 900) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && !/status of 500/.test(m.text()) && errors.push(m.text())); // the 500 is the simulated backend failure
  return p;
}
// ---- cookie consent: no non-essential integrations configured → no banner, no cookies
let p = await newPage();
const reqs = [];
p.on('request', (r) => reqs.push(r.url()));
await p.goto(B + '/lv/', { waitUntil: 'networkidle' });
ok(!(await p.isVisible('[data-cc-banner]')), 'no consent banner while no tracking is configured');
ok(!reqs.some((u) => /googletagmanager|google-analytics|facebook/.test(u)), 'no tracking requests');
ok((await p.context().cookies()).length === 0, 'no cookies set');
ok(await p.locator('footer [data-cookie-settings]').count() === 0, 'no cookie-settings link without consent mechanism');

// ---- package toggle
await p.goto(B + '/lv/', { waitUntil: 'networkidle' });
const bat = async () => p.locator('.pc--featured .pc__line').innerText();
const before = await bat();
await p.click('[data-mode-btn="without"]');
const after = await bat();
ok(before !== after && /bez akumulatora/.test(after), `battery toggle switches configuration (${before.replace(/\s+/g,' ')} → ${after.replace(/\s+/g,' ')})`);
ok((await p.locator('.pc--featured .pc__net').innerText()).includes('7,92 kWp'), 'card shows installed capacity');
const offerHref = await p.locator('.pc--featured a[data-cta]:visible').first().getAttribute('href');
ok(/package=home-8&battery=0/.test(offerHref), 'card CTA passes package + battery to the request form');
await p.click('[data-mode-btn="with"]');

// ---- hotspots
await p.click('[data-pin="battery"]');
ok(await p.isVisible('[data-info="battery"]') && await p.isHidden('[data-info="panels"]'), 'hotspot switches info card');

// ---- calculator + day/night simulation removed
ok(await p.locator('[data-daynight], #calculator, #calc-kwh, [data-out]').count() === 0, 'home: no calculator or day/night widget');
{
  const { execSync } = await import('child_process');
  const hits = execSync(String.raw`grep -rliE "kalkul|калькул|calculator|data-daynight|calc-kwh" dist --include=*.html --include=*.js --include=*.xml || true`).toString().trim();
  ok(hits === '', 'no calculator references in generated site' + (hits ? ': ' + hits : ''));
  const r = await fetch(B + '/lv/kalkulators/');
  ok(r.status === 404, 'old calculator URL is not a page (Netlify 301 → packages)');
  const toml = (await import('fs')).readFileSync('../netlify.toml', 'utf8');
  ok(['/lv/kalkulators/*', '/ru/kalkulyator/*', '/en/calculator/*'].every((u) => toml.includes(`from = "${u}"`)), 'netlify.toml redirects old calculator URLs');
}

// ---- subsidy: unverified amounts hidden
await p.goto(B + '/lv/', { waitUntil: 'networkidle' });
ok(!/€/.test(await p.locator('#support').innerText()), 'unverified subsidy amounts are not shown');
ok(await p.locator('.dev-note').count() === 0, 'no development notes in production HTML');

// ---- SUNPRO panel data
{
  const html = await p.content();
  ok(['6,16 kWp', '7,92 kWp', '10,12 kWp'].every((x) => html.includes(x)), 'installed kWp shown (6,16 / 7,92 / 10,12)');
  ok(/14 × SUNPRO POWER 440/.test(await p.locator('.pc').first().innerText()), 'card shows panel count + SUNPRO');
  await p.goto(B + '/lv/saules-paneli/sunpro-power-sp440-n108m10/', { waitUntil: 'networkidle' });
  const t = await p.locator('main, body').first().innerText();
  ok(t.includes('SP440-N108M10') && t.includes('22,53') && t.includes('38,53') && t.includes('10,12 kWp'), 'panel page: model, efficiency, Voc, packages');
  ok(!/garantij/i.test(await p.locator('.eq__spec').innerText()), 'panel page: no unconfirmed warranty rows');
  const { execSync } = await import('child_process');
  let hits = ''; try { hits = execSync("grep -rlE 'Growatt|Renon|Huawei|Sungrow|Deye|AIKO' dist --include=*.html || true").toString().trim(); } catch {}
  ok(hits === '', 'no non-SUNPRO equipment brands in built pages' + (hits ? ': ' + hits : ''));
}

// ---- lead form
await p.goto(B + '/lv/pieprasit-piedavajumu/?package=home-8&battery=1&kwh=700', { waitUntil: 'networkidle' });
const f = p.locator('#lead-offer');
await f.locator('[data-next]').click();
ok((await f.locator('[data-error-for="address"]').innerText()).length > 0, 'step1 empty address → error');
await f.locator('[name="address"]').fill('Mārupe');
await f.locator('[data-next]').click();
ok(await f.locator('[data-step-panel="2"]').isVisible(), 'advance to step 2');
ok((await f.locator('[name="usage"]').inputValue()) === '700', 'usage prefilled from URL');
ok(await f.locator('[name="usageUnit"][value="eur"]').count() === 0, 'no electricity-bill (€) input in the form');
await f.locator('[data-next]').click();
ok(await f.locator('[data-step-panel="3"]').isVisible(), 'advance to step 3');
ok(await f.locator('[data-prefill-interest="battery"]').isChecked(), 'battery interest prefilled');
ok((await f.locator('select[name="package"]').inputValue()) === 'home-8', 'package selector prefilled from URL');
ok(await f.locator('.lf__notice').isVisible(), 'form states upfront that online requests are not connected');
await f.locator('[data-next]').click();
await f.locator('[name="phone"]').fill('12');
await f.locator('[name="email"]').fill('bad');
await f.locator('[data-submit]').click();
ok((await f.locator('[data-error-for="name"]').innerText()).length > 0 && (await f.locator('[data-error-for="phone"]').innerText()).length > 0 && (await f.locator('[data-error-for="email"]').innerText()).length > 0, 'step4 validation errors');
await p.waitForTimeout(3000); // anti-bot minimum fill time
await f.locator('[name="name"]').fill('Test');
await f.locator('[name="message"]').fill('Testa komentārs');
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
ok(await f.locator('[data-done]').isVisible() && received?.email === 'test@example.com' && received?.package === 'home-8' && /7,92 kWp/.test(received?.packageLabel ?? '') && received?.message === 'Testa komentārs', 'backend 200 → success with payload (package, label, message)');
ok(await f.locator('.lf__privacy a').getAttribute('href') === '/lv/privatuma-politika/', 'privacy link localized');
// Netlify Forms adapter: URL-encoded POST to "/" with form-name; success only on 2xx
{
  const q = await newPage();
  await q.goto(B + '/en/request-a-quote/?package=home-6', { waitUntil: 'networkidle' }).catch(() => {});
  const g = q.locator('form[data-lead-form]').first();
  await g.evaluate((el) => { el.dataset.leads = JSON.stringify({ provider: 'netlify', endpoint: '', accessKey: '', portalId: '', formGuid: '', subject: '', timeoutMs: 4000 }); });
  let body = null;
  await q.route(B + '/en/request-a-quote/', (r) => { if (r.request().method() === 'POST') { body = r.request().postData(); r.fulfill({ status: 200, body: 'ok' }); } else r.continue(); });
  await g.locator('[name="address"]').fill('Rīga'); await g.locator('[data-next]').click();
  await g.locator('[data-usage-unknown]').check({ force: true }); await g.locator('[data-next]').click();
  await g.locator('[data-prefill-interest="solar"]').check({ force: true }); await g.locator('[data-next]').click();
  await q.waitForTimeout(3000);
  await g.locator('[name="name"]').fill('Test'); await g.locator('[name="phone"]').fill('+371 20000000'); await g.locator('[name="email"]').fill('t@example.com');
  await g.locator('[data-submit]').click(); await q.waitForTimeout(600);
  ok(!!body && body.includes('form-name=aidex-request') && body.includes('package=home-6') && await g.locator('[data-done]').isVisible(), 'Netlify Forms adapter posts form-name + data to the page URL, success on 200');
}

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
// ---- no prices in generated output (all HTML + JS)
{
  const { execSync } = await import('child_process');
  const bad = execSync(String.raw`grep -rlE "(3[  ]?700|4[  ]?900|6[  ]?800|9[  ]?000|11[  ]?500|13[  ]?300|10[  ]?900|5[  ]?600|7[  ]?400|9[  ]?200)[  ]?€|€[  ]?(3,?700|4,?900|6,?800)|€/W" dist || true`).toString().trim();
  const euro = execSync(String.raw`grep -rlE "€|&euro;|EUR\b" dist --include=*.html || true`).toString().trim();
  ok(euro === '', 'no € amounts anywhere in generated HTML' + (euro ? ': ' + euro : ''));
  ok(bad === '', 'no package prices in generated site' + (bad ? ': ' + bad : ''));
}
ok(errors.length === 0, 'no JS errors ' + errors.join(' | '));
await browser.close();
