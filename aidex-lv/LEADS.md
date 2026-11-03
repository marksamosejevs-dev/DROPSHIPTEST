# Lead form: connecting the enquiry destination

Every request form on the site uses one component: the homepage, the request page, the contact and business pages, and the package buttons. Enquiries go to **info@aidex-energy.com** (Netlify Forms e-mail notification). **On Netlify builds it uses Netlify Forms automatically** (Netlify sets `NETLIFY=true` during its build). Another destination can be chosen with **build environment variables**, which you set in the Netlify dashboard (Site configuration → Environment variables). No code change is needed. The logic is in `src/config/leads.ts`.

> Only **public** values go into these variables, because they end up in the page source. Never put a secret API key in them.

## Behaviour when no destination applies

On a non-Netlify build without `PUBLIC_LEAD_PROVIDER` (e.g. local `npm run build`), the provider is `disabled`:

- the form shows a notice up front: *"Online requests are not connected yet — requests are not being sent at the moment"*;
- on submit, **nothing is sent** and the thank-you screen is **not** shown. An honest "not connected" message appears, with the phone number and e-mail added once they are filled in `src/config/company.ts`, and what the visitor typed stays in the form.

Once a destination is configured, the thank-you screen appears **only** after the service confirms it received the enquiry. A network error, a timeout (15 s), a non-2xx status or a negative JSON reply shows an error instead, and the visitor's input is kept.

## What each enquiry contains

| Field | Example |
|---|---|
| `address` | Mārupe |
| `usageUnit` / `usage` / `usageUnknown` | `kwh` / 600 (monthly kWh) / set when "I don't know" is ticked |
| `interests` | solar, battery, ev, consult |
| `package` / `packageLabel` | `home-8` / "AIDEX Home 8 · 7,92 kWp" (chosen in the form, or pre-filled from a package card) |
| `name`, `phone`, `email` | required |
| `message` | optional comment (max. 1,000 characters) |
| `lang`, `source`, `page` | lv / ru / en, where the form was used, page path |
| `utm`, `submittedAt` | campaign parameters, ISO timestamp |

Spam protection: a hidden honeypot field, plus a minimum fill time of 3 s. The form also explains how enquiry data is processed and links to the Privacy Policy. There is no marketing consent in the form.

---

## Recommended: Netlify Forms (no keys, no extra service)

**How it works**
- Netlify detects one form, `aidex-request`, from the static file `public/__forms.html` (published as `/__forms.html`).
- Every request form (LV / RU / EN, every page) is sent by JavaScript as a URL-encoded POST to `/__forms.html` with `form-name=aidex-request`. No redirect rule touches that path.
- Netlify builds use this automatically (Netlify sets `NETLIFY=true`), so no environment variable is needed.
- The thank-you message appears only after Netlify answers 2xx. Any other answer shows an error with a link to **info@aidex-energy.com**.

**Fields stored and e-mailed:** `name`, `email`, `phone`, `package` (e.g. "AIDEX Home 8 · 7,92 kWp" or "not selected"), `consumption` ("650 kWh per month" / "not known" / "not provided"), `message`, `address`, `interests`, `language`, `submitted_at` (Europe/Riga time), `page`, `source`. Keep `public/__forms.html` in sync with `netlifyFields()` in `src/scripts/lead-form.ts`; `node render/netlifycheck.mjs` checks this.

**Dashboard steps (one time)**
1. **Forms → Enable form detection.** New Netlify sites have it OFF; while it is off, every POST is rejected and the visitor sees "Neizdevās nosūtīt pieteikumu".
2. **Deploys → Trigger deploy → Deploy project without cache**, so the form is detected.
3. Check that **Forms** lists `aidex-request`.
4. **Forms → aidex-request → Form notifications → Add notification → Email notification** → *Email to notify*: `info@aidex-energy.com`.
5. Send a test request in LV, RU and EN. Each one must appear under **Forms → aidex-request**, and an e-mail must arrive at info@aidex-energy.com. Check spam the first time; the sender is Netlify (formresponses@netlify.com).
6. Spam: Netlify filters submissions with Akismet and the honeypot. Check **Forms → aidex-request → Spam submissions** if a test does not appear.

Netlify (Netlify, Inc.) then processes visitor data, so add it to the Privacy Policy recipients.

## Option A: e-mail through a form-relay service

| Service | Variables |
|---|---|
| Web3Forms | `PUBLIC_LEAD_PROVIDER=web3forms`, `PUBLIC_WEB3FORMS_ACCESS_KEY=<public access key from web3forms.com>` |
| Formspree | `PUBLIC_LEAD_PROVIDER=formspree`, `PUBLIC_LEAD_ENDPOINT=https://formspree.io/f/<id>` |

**What I need from you:** the receiving e-mail address, and the access key or endpoint created with that address.

## Option B: CRM

| Destination | Variables |
|---|---|
| HubSpot | `PUBLIC_LEAD_PROVIDER=hubspot`, `PUBLIC_HUBSPOT_PORTAL_ID`, `PUBLIC_HUBSPOT_FORM_GUID`. The form needs the fields `firstname`, `lastname`, `email`, `phone`, `address`, `message`. |
| Any CRM through a webhook (Make, Zapier, a CRM web-form URL or your own function) | `PUBLIC_LEAD_PROVIDER=webhook`, `PUBLIC_LEAD_ENDPOINT=https://…`. It must accept a JSON POST, allow CORS from `https://aidex.lv`, and return 2xx only once the enquiry is stored. |

CRM API keys are secret, so they belong in the webhook service and never in these variables.

## Before switching on

- [ ] Send one test enquiry in each language and confirm it arrives.
- [ ] Confirm that a failing destination shows an error, not "Thank you".
- [ ] Add the processor (Netlify, Web3Forms, Formspree, HubSpot, Make…) to the Privacy Policy recipients.
- [ ] Confirm the retention period for enquiries (the Privacy Policy currently says 12 months).
