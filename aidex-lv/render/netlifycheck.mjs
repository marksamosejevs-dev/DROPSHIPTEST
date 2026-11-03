// Netlify Forms compatibility check: builds the site as Netlify would
// (NETLIFY=true) into a temp dir and verifies what Netlify's form detection
// and the submit script need. Usage: node render/netlifycheck.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'aidex-netlify-'));
execSync(`npx astro build --outDir ${out}`, { env: { ...process.env, NETLIFY: 'true' }, stdio: 'ignore' });
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const walk = (d, acc = []) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p, acc) : acc.push(p); } return acc; };
const files = walk(out);

// 1. The static definition Netlify detects at deploy time
const defPath = path.join(out, '__forms.html');
ok(fs.existsSync(defPath), '/__forms.html is in the published output');
const def = fs.existsSync(defPath) ? fs.readFileSync(defPath, 'utf8') : '';
const defForm = (def.match(/<form[^>]*>/) || [''])[0];
ok(/name="aidex-request"/.test(defForm) && /data-netlify="true"/.test(defForm) && /netlify-honeypot="website"/.test(defForm), 'definition: name="aidex-request", data-netlify, honeypot "website"');
const defFields = new Set([...def.matchAll(/<(?:input|textarea|select)[^>]*name="([^"]+)"/g)].map((m) => m[1]));

// 2. The fields the script actually posts must all be declared
const src = fs.readFileSync('src/scripts/lead-form.ts', 'utf8');
const body = src.slice(src.indexOf('const netlifyFields'), src.indexOf('/** Flattens'));
const posted = [...body.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]);
const required = ['name', 'email', 'phone', 'package', 'consumption', 'message', 'submitted_at', 'language'];
ok(required.every((k) => posted.includes(k)), 'script posts name, email, phone, package, consumption, message, submitted_at, language');
const missing = ['form-name', ...posted].filter((k) => !defFields.has(k));
ok(missing.length === 0, 'every posted field is declared in the definition' + (missing.length ? ': missing ' + missing : ''));

// 3. Built JS posts to the definition file (never redirected), not to "/" or the page
const js = files.filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
ok(js.includes('/__forms.html') && js.includes('aidex-request'), 'built JS posts form-name=aidex-request to /__forms.html');
const toml = fs.readFileSync('../netlify.toml', 'utf8');
ok(!/from = "\/__forms\.html"/.test(toml) && !/from = "\/\*"/.test(toml), 'no redirect rule touches /__forms.html');

// 4. Page forms use the Netlify adapter and do not register conflicting definitions
const pages = files.filter((f) => f.endsWith('.html') && !f.endsWith('__forms.html'));
const forms = pages.flatMap((p) => [...fs.readFileSync(p, 'utf8').matchAll(/<form[^>]*data-lead-form[^>]*>/g)].map((m) => m[0]));
ok(forms.length > 0 && forms.every((f) => /&quot;provider&quot;:&quot;netlify&quot;/.test(f)), `${forms.length} page forms use the Netlify adapter`);
ok(forms.every((f) => !/data-netlify/.test(f)), 'page forms carry no second (conflicting) Netlify definition');
ok(!forms.some((f) => /accessKey&quot;:&quot;[^&]/.test(f)), 'no access keys in form config');
for (const l of ['lv', 'ru', 'en']) ok(pages.some((p) => p.includes(`${path.sep}${l}${path.sep}`) && fs.readFileSync(p, 'utf8').includes('data-lead-form')), `request form present on ${l.toUpperCase()} pages`);
fs.rmSync(out, { recursive: true, force: true });
