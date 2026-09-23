/** Multi-step lead form behaviour: validation, step navigation, prefill, submit. */
type Errors = Record<'required' | 'address' | 'usage' | 'number' | 'interests' | 'name' | 'phone' | 'email' | 'submit', string>;

const PHONE = /^\+?[0-9 ()-]{7,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

document.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach((form) => {
  const errors: Errors = JSON.parse(form.dataset.errors!);
  const panels = [...form.querySelectorAll<HTMLElement>('[data-step-panel]')];
  const total = panels.length;
  const next = form.querySelector<HTMLButtonElement>('[data-next]')!;
  const back = form.querySelector<HTMLButtonElement>('[data-back]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const stepOf = form.querySelector<HTMLElement>('[data-stepof]')!;
  const submitErr = form.querySelector<HTMLElement>('[data-submit-error]')!;
  let step = 1;

  // ---- prefill from URL (?package=home-8&battery=1&kwh=600) ----
  const qs = new URLSearchParams(location.search);
  const setVal = (sel: string, v: string | null) => { const el = form.querySelector<HTMLInputElement>(sel); if (el && v) el.value = v; };
  setVal('[data-prefill="package"]', qs.get('package'));
  setVal('[data-prefill="kwh"]', qs.get('kwh'));
  setVal('[data-prefill="page"]', location.pathname);
  if (qs.get('package') || qs.get('kwh')) form.querySelector<HTMLInputElement>('[data-prefill-interest="solar"]')!.checked = true;
  if (qs.get('battery') === '1') form.querySelector<HTMLInputElement>('[data-prefill-interest="battery"]')!.checked = true;

  // ---- usage unit switch ----
  const usage = form.querySelector<HTMLInputElement>('[name="usage"]')!;
  const usageLabel = form.querySelector<HTMLElement>('[data-usage-label]')!;
  const unitLabel = form.querySelector<HTMLElement>('[data-unit-label]')!;
  const unknown = form.querySelector<HTMLInputElement>('[data-usage-unknown]')!;
  form.querySelectorAll<HTMLInputElement>('[data-unit]').forEach((r) => r.addEventListener('change', () => {
    const u = r.value as 'kwh' | 'eur';
    usageLabel.textContent = usageLabel.dataset[u]!;
    unitLabel.textContent = unitLabel.dataset[u]!;
  }));
  unknown.addEventListener('change', () => { usage.disabled = unknown.checked; if (unknown.checked) clear('usage'); });

  // ---- validation ----
  const errEl = (k: string) => form.querySelector<HTMLElement>(`[data-error-for="${k}"]`);
  function show(k: string, msg: string, input?: HTMLElement | null) {
    const e = errEl(k); if (e) e.textContent = msg;
    input?.setAttribute('aria-invalid', 'true');
  }
  function clear(k: string) {
    const e = errEl(k); if (e) e.textContent = '';
    form.querySelectorAll(`[data-validate="${k}"]`).forEach((i) => i.removeAttribute('aria-invalid'));
  }
  function validate(n: number): HTMLElement | null {
    let first: HTMLElement | null = null;
    const fail = (k: string, msg: string, input: HTMLElement | null) => { show(k, msg, input); first ??= input; };
    if (n === 1) {
      const a = form.querySelector<HTMLInputElement>('[name="address"]')!;
      clear('address');
      if (a.value.trim().length < 2) fail('address', errors.address, a);
    }
    if (n === 2) {
      clear('usage');
      if (!unknown.checked) {
        const v = usage.value.trim().replace(',', '.');
        if (!v) fail('usage', errors.usage, usage);
        else if (!Number.isFinite(Number(v)) || Number(v) <= 0) fail('usage', errors.number, usage);
      }
    }
    if (n === 3) {
      clear('interests');
      const boxes = form.querySelectorAll<HTMLInputElement>('[name="interests"]');
      if (![...boxes].some((b) => b.checked)) fail('interests', errors.interests, boxes[0]);
    }
    if (n === 4) {
      const name = form.querySelector<HTMLInputElement>('[name="name"]')!;
      const phone = form.querySelector<HTMLInputElement>('[name="phone"]')!;
      const email = form.querySelector<HTMLInputElement>('[name="email"]')!;
      ['name', 'phone', 'email'].forEach(clear);
      if (name.value.trim().length < 2) fail('name', errors.name, name);
      if (!PHONE.test(phone.value.trim())) fail('phone', phone.value.trim() ? errors.phone : errors.required, phone);
      if (!EMAIL.test(email.value.trim())) fail('email', email.value.trim() ? errors.email : errors.required, email);
    }
    return first;
  }
  // live-clear errors while typing
  form.addEventListener('input', (e) => {
    const k = (e.target as HTMLElement).dataset?.validate;
    if (k && errEl(k)?.textContent) clear(k);
  });

  // ---- steps ----
  function go(n: number, focus = true) {
    step = Math.min(total, Math.max(1, n));
    form.dataset.step = String(step);
    panels.forEach((p) => p.classList.toggle('is-active', Number(p.dataset.stepPanel) === step));
    form.querySelectorAll<HTMLElement>('[data-pstep]').forEach((p) => {
      const i = Number(p.dataset.pstep);
      p.classList.toggle('is-active', i === step);
      p.classList.toggle('is-done', i < step);
    });
    back.hidden = step === 1;
    stepOf.textContent = stepOf.dataset.template!.replace(/0/, String(step));
    if (focus) panels[step - 1].querySelector<HTMLElement>('input:not([type=hidden]):not([disabled])')?.focus({ preventScroll: true });
  }
  next.addEventListener('click', () => {
    const bad = validate(step);
    if (bad) { bad.focus(); return; }
    go(step + 1);
  });
  back.addEventListener('click', () => go(step - 1));
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && step < total && (e.target as HTMLElement).tagName === 'INPUT') { e.preventDefault(); next.click(); }
  });
  go(1, false);

  // ---- submit ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitErr.textContent = '';
    for (let i = 1; i <= total; i++) {
      const bad = validate(i);
      if (bad) { go(i, false); bad.focus(); return; }
    }
    const fd = new FormData(form);
    if (fd.get('website')) return; // honeypot
    const data: Record<string, unknown> = Object.fromEntries(fd.entries());
    data.interests = fd.getAll('interests');
    data.utm = Object.fromEntries([...qs.entries()].filter(([k]) => k.startsWith('utm_')));
    data.submittedAt = new Date().toISOString();
    delete data.website;

    const endpoint = form.dataset.endpoint;
    const label = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = form.dataset.sending!;
    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(String(res.status));
      } else {
        // Development mode: no endpoint configured — nothing leaves the browser.
        await new Promise((r) => setTimeout(r, 500));
        form.querySelector<HTMLElement>('[data-dev-note]')!.hidden = false;
      }
      form.classList.add('is-done');
      const done = form.querySelector<HTMLElement>('[data-done]')!;
      done.hidden = false;
      done.focus();
      (window as any).dataLayer?.push({ event: 'generate_lead', form_source: data.source });
    } catch {
      submitErr.textContent = errors.submit;
    } finally {
      submit.disabled = false;
      submit.innerHTML = label;
    }
  });
});

export {};
