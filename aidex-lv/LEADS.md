# Lead form: connecting the enquiry destination

Every request form on the site uses one component: the homepage, the request page, the contact and business pages, and the package and calculator buttons. Its destination is chosen with **build environment variables**, which you set in the Netlify dashboard (Site configuration → Environment variables). No code change is needed. The logic is in `src/config/leads.ts`.

> Only **public** values go into these variables, because they end up in the page source. Never put a secret API key in them.

## Current behaviour (nothing configured)

`PUBLIC_LEAD_PROVIDER` is not set, so the provider is `disabled`:

- the form shows a notice up front: *"Online requests are not connected yet — requests are not being sent at the moment"*;
- on submit, **nothing is sent** and the thank-you screen is **not** shown. An honest "not connected" message appears, with the phone number and e-mail added once they are filled in `src/config/company.ts`, and what the visitor typed stays in the form.

Once a destination is configured, the thank-you screen appears **only** after the service confirms it received the enquiry. A network error, a timeout (15 s), a non-2xx status or a negative JSON reply shows an error instead, and the visitor's input is kept.

## What each enquiry contains

| Field | Example |
|---|---|
| `address` | Mārupe |
| `usageUnit` / `usage` / `usageUnknown` | `kwh` or `eur` / 600 / set when "I don't know" is ticked |
| `interests` | solar, battery, ev, consult |
| `package` / `packageLabel` | `home-8` / "AIDEX Home 8 · 7,92 kWp" (chosen in the form, or pre-filled from a package card or the calculator) |
| `name`, `phone`, `email` | required |
| `message` | optional comment (max. 1,000 characters) |
| `lang`, `source`, `page` | lv / ru / en, where the form was used, page path |
| `utm`, `submittedAt` | campaign parameters, ISO timestamp |

Spam protection: a hidden honeypot field, plus a minimum fill time of 3 s. The form also explains how enquiry data is processed and links to the Privacy Policy. There is no marketing consent in the form.

---

## Recommended: Netlify Forms (no keys, no extra service)

Use this when the site is hosted on Netlify.

1. In Netlify, open **Site configuration → Environment variables** and add `PUBLIC_LEAD_PROVIDER` = `netlify`.
2. Open **Forms** and click **Enable form detection**.
3. Redeploy (**Deploys → Trigger deploy**). Netlify detects the form `aidex-request`.
4. Open **Forms → aidex-request → Form notifications → Add notification → Email notification**, and enter the e-mail address that should receive enquiries.
5. Test from LV, RU and EN. Each submission appears under Forms, and a notification e-mail is sent.

**What I need from you:** the receiving e-mail address, and confirmation that you accept Netlify (Netlify, Inc.) as a data processor. It must be added to the Privacy Policy recipients.

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
