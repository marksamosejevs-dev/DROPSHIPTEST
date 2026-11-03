// Netlify Forms compatibility check: builds the site as Netlify would
// (NETLIFY=true) into a temp dir and verifies the static form markup that
// Netlify's form detection needs. Usage: node render/netlifycheck.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'aidex-netlify-'));
execSync(`npx astro build --outDir ${out}`, { env: { ...process.env, NETLIFY: 'true' }, stdio: 'ignore' });
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };

const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p); } })(out);
const withForm = pages.filter((p) => fs.readFileSync(p, 'utf8').includes('data-lead-form'));
const forms = withForm.flatMap((p) => [...fs.readFileSync(p, 'utf8').matchAll(/<form[^>]*data-lead-form[^>]*>[\s\S]*?<\/form>/g)].map((m) => m[0]));

ok(forms.length > 0, `${forms.length} request forms on ${withForm.length} pages`);
ok(forms.every((f) => /name="aidex-request"/.test(f.match(/<form[^>]*>/)[0]) && /data-netlify="true"/.test(f) && /netlify-honeypot="website"/.test(f)), 'every form: name="aidex-request", data-netlify, honeypot');
ok(forms.every((f) => /<input type="hidden" name="form-name" value="aidex-request"/.test(f)), 'every form: hidden form-name input');
ok(forms.every((f) => /&quot;provider&quot;:&quot;netlify&quot;/.test(f)), 'Netlify build uses the Netlify Forms adapter automatically');
const posted = ['address', 'usageUnit', 'usage', 'usageUnknown', 'interests', 'package', 'packageLabel', 'name', 'phone', 'email', 'message', 'lang', 'source', 'page', 'utm', 'submittedAt'];
const missing = posted.filter((k) => !forms.every((f) => f.includes(`name="${k}"`)));
ok(missing.length === 0, 'every submitted field is declared in the static form' + (missing.length ? ': missing ' + missing : ''));
ok(!forms.some((f) => /accessKey&quot;:&quot;[^&]/.test(f)), 'no access keys in form config');
fs.rmSync(out, { recursive: true, force: true });
