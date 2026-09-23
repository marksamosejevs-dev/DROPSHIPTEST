/**
 * GDPR / ePrivacy cookie consent.
 * - Nothing non-essential runs before an explicit choice.
 * - "Accept all" and "Reject non-essential" have equal prominence.
 * - The choice is stored in a first-party, strictly necessary cookie + localStorage.
 * - Consent can be changed or withdrawn at any time ([data-cookie-settings]).
 * - Withdrawing a category deletes known cookies of that category and reloads
 *   the page so that previously loaded scripts are removed.
 */
type Category = 'analytics' | 'marketing';
interface Consent { v: number; necessary: true; analytics: boolean; marketing: boolean; ts: string }
declare global {
  interface Window {
    __AIDEX_CONSENT_CFG: { v: number; ga: string; meta: string };
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
    _fbq?: unknown;
    aidexConsent: { get: () => Consent | null; open: () => void; has: (c: Category) => boolean };
  }
}

const KEY = 'aidex_consent';
const cfg = window.__AIDEX_CONSENT_CFG;
const MAX_AGE = 60 * 60 * 24 * 180; // 6 months, then ask again

const COOKIE_PATTERNS: Record<Category, RegExp[]> = {
  analytics: [/^_ga/, /^_gid$/, /^_gat/],
  marketing: [/^_fbp$/, /^_fbc$/, /^_gcl/, /^fr$/],
};

function read(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY) ?? decodeURIComponent(document.cookie.split('; ').find((c) => c.startsWith(KEY + '='))?.split('=')[1] ?? '');
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (c.v !== cfg.v) return null;
    if (Date.now() - new Date(c.ts).getTime() > MAX_AGE * 1000) return null;
    return c;
  } catch {
    return null;
  }
}

function write(c: Consent) {
  const raw = JSON.stringify(c);
  try { localStorage.setItem(KEY, raw); } catch { /* storage disabled */ }
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${KEY}=${encodeURIComponent(raw)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

function deleteCookies(cat: Category) {
  const host = location.hostname;
  const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
  document.cookie.split('; ').forEach((pair) => {
    const name = pair.split('=')[0];
    if (!COOKIE_PATTERNS[cat].some((re) => re.test(name))) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; Path=/${d ? '; Domain=' + d : ''}`;
    });
  });
}

let loaded = { analytics: false, marketing: false };

function loadScript(src: string) {
  const s = document.createElement('script');
  s.async = true; s.src = src; document.head.appendChild(s);
}

function apply(c: Consent) {
  window.gtag('consent', 'update', {
    analytics_storage: c.analytics ? 'granted' : 'denied',
    ad_storage: c.marketing ? 'granted' : 'denied',
    ad_user_data: c.marketing ? 'granted' : 'denied',
    ad_personalization: c.marketing ? 'granted' : 'denied',
  });
  if (c.analytics && !loaded.analytics) {
    loaded.analytics = true;
    if (cfg.ga) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${cfg.ga}`);
      window.gtag('js', new Date());
      window.gtag('config', cfg.ga, { anonymize_ip: true });
    }
  }
  if (c.marketing && !loaded.marketing) {
    loaded.marketing = true;
    if (cfg.meta) {
      /* Meta Pixel base code (loaded only after marketing consent) */
      const f = window as any;
      if (!f.fbq) {
        const n: any = (f.fbq = function (...a: unknown[]) { n.callMethod ? n.callMethod(...a) : n.queue.push(a); });
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        loadScript('https://connect.facebook.net/en_US/fbevents.js');
      }
      f.fbq('init', cfg.meta); f.fbq('track', 'PageView');
    }
  }
  // Generic opt-in scripts: <script type="text/plain" data-consent="analytics" data-src="…">
  document.querySelectorAll<HTMLScriptElement>('script[type="text/plain"][data-consent]').forEach((el) => {
    const cat = el.dataset.consent as Category;
    if (!c[cat] || el.dataset.activated) return;
    el.dataset.activated = '1';
    const s = document.createElement('script');
    if (el.dataset.src) s.src = el.dataset.src; else s.text = el.text;
    document.head.appendChild(s);
  });
  document.dispatchEvent(new CustomEvent('aidex:consent', { detail: c }));
}

const banner = document.querySelector<HTMLElement>('[data-cc-banner]');
const dialog = document.querySelector<HTMLDialogElement>('[data-cc-prefs]');
const status = document.querySelector<HTMLElement>('[data-cc-status]');

function save(analytics: boolean, marketing: boolean) {
  const prev = read();
  const c: Consent = { v: cfg.v, necessary: true, analytics, marketing, ts: new Date().toISOString() };
  write(c);
  banner?.setAttribute('hidden', '');
  if (dialog?.open) dialog.close();
  if (status) { status.textContent = ''; requestAnimationFrame(() => (status.textContent = status.dataset.msg ?? '')); }
  const withdrawn = (['analytics', 'marketing'] as Category[]).filter((k) => (prev?.[k] || loaded[k]) && !c[k]);
  if (withdrawn.length) {
    withdrawn.forEach(deleteCookies);
    if (withdrawn.some((k) => loaded[k])) { location.reload(); return; }
  }
  apply(c);
}

function openPrefs() {
  const c = read();
  dialog?.querySelectorAll<HTMLInputElement>('[data-cc-cat]').forEach((i) => {
    i.checked = !!c?.[i.dataset.ccCat as Category];
  });
  if (dialog && !dialog.open) dialog.showModal();
}

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cc], [data-cookie-settings]');
  if (!el) return;
  if (el.hasAttribute('data-cookie-settings')) { e.preventDefault(); openPrefs(); return; }
  const action = el.dataset.cc;
  if (action === 'accept') save(true, true);
  else if (action === 'reject') save(false, false);
  else if (action === 'manage') openPrefs();
  else if (action === 'save') {
    const get = (k: Category) => !!dialog?.querySelector<HTMLInputElement>(`[data-cc-cat="${k}"]`)?.checked;
    save(get('analytics'), get('marketing'));
  }
});

// Close the dialog with Escape without saving: banner stays if no choice exists.
dialog?.addEventListener('close', () => { if (!read()) banner?.removeAttribute('hidden'); });

const existing = read();
if (existing) apply(existing);
else banner?.removeAttribute('hidden');

window.aidexConsent = { get: read, open: openPrefs, has: (c) => !!read()?.[c] };
if (location.hash === '#cookie-settings') openPrefs();

export {};
