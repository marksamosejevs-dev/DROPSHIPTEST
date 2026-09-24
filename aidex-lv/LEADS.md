# Lead form: connecting the enquiry destination

All request forms on the site (homepage, offer page, contact page, package and
calculator buttons) use one component. Its destination is set in one file:
**`src/config/leads.ts`**.

## Current behaviour (nothing configured)

`provider: 'disabled'`. When a visitor submits:

- **nothing is sent**, and the thank-you screen is **not** shown;
- an honest notice appears: *"The request form is not connected yet — your request has not been sent"*. The phone number and e-mail from `src/config/company.ts` are added to it once they are filled in;
- what the visitor typed stays in the form;
- the payload is written to the browser console (for testing only).

Once a destination is configured, the thank-you screen appears **only** after the service confirms it received the enquiry. A network error, timeout (15 s), non-2xx status or a negative JSON reply shows an error message instead, and the visitor's input is kept.

## What each enquiry contains

| Field | Example |
|---|---|
| `address` | Mārupe |
| `usageUnit` / `usage` / `usageUnknown` | `kwh` or `eur` / 600 / set when "I don't know" is ticked |
| `interests` | solar, battery, ev, consult |
| `name`, `phone`, `email` | — |
| `package` | e.g. `home-8` (when the visitor came from a package card) |
| `lang` | lv / ru / en |
| `source` | form location, e.g. `home`, `offer-page`, `contact`, `business`, `packages` |
| `page` | page path |
| `utm` | utm_* parameters, if present |
| `submittedAt` | ISO timestamp |

There is no marketing consent in the form. The Privacy Policy covers how enquiry data is processed.

---

## Option A: receive enquiries by e-mail

A static website cannot send e-mail by itself, so it needs a small form-relay service. The two below work without our own server, and their keys are safe to be public.

### A1. Web3Forms (simplest; free tier available)

**What I need from you:**

1. The e-mail address that should receive enquiries (e.g. `info@aidex.lv`).
2. A Web3Forms **access key**. Create it at web3forms.com with that e-mail address; the key is e-mailed to you.
3. Optional: the subject line (default: *"AIDEX.lv — jauns pieteikums"*).

**Configuration:**
```ts
provider: 'web3forms',
accessKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
```

### A2. Formspree

**What I need from you:**

1. A Formspree account owned by the company, with the receiving e-mail verified.
2. The form endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. In Formspree, set the allowed domain to `aidex.lv`.

**Configuration:**
```ts
provider: 'formspree',
endpoint: 'https://formspree.io/f/abcdwxyz',
```

For either service, also tell me who the processor is, so the Privacy Policy lists it as a data processor.

---

## Option B: send enquiries to a CRM

### B1. HubSpot (native support)

**What I need from you:**

1. HubSpot **Portal ID** (Hub ID).
2. **Form GUID** of a HubSpot form that contains the fields `firstname`, `lastname`, `email`, `phone`, `address` and `message`. All the other enquiry data is placed in `message`.

**Configuration:**
```ts
provider: 'hubspot',
portalId: '12345678',
formGuid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
```

### B2. Any other CRM (Pipedrive, Bitrix24, Salesforce, Zoho, amoCRM…) through a webhook

CRM API keys are secret and must never be placed in the website. The site therefore posts to a **webhook URL** that forwards the enquiry to the CRM. That URL can be:

- a Make.com or Zapier "Custom webhook" scenario → CRM (no code), or
- a CRM's own incoming-webhook / web-form URL, if it accepts JSON from browsers, or
- a small serverless function of your own (Cloudflare Worker, Netlify or Vercel function) that holds the CRM key.

**What I need from you:**

1. The **webhook URL** (must be `https://`).
2. Confirmation that it:
   - accepts `POST` with a JSON body (the fields in the table above);
   - allows cross-origin requests from `https://aidex.lv` (CORS);
   - returns HTTP **2xx** only when the enquiry is stored. Optionally it returns `{ "ok": true }`; `{ "ok": false }` is treated as a failure.
3. The CRM field mapping you want (which of our fields go to which CRM fields).
4. Optionally, an e-mail notification rule in the CRM or Make/Zapier, so the sales team is alerted.

**Configuration:**
```ts
provider: 'webhook',
endpoint: 'https://hook.eu1.make.com/xxxxxxxx',
```

---

## Before switching on

- [ ] Send one test enquiry from each language (LV/RU/EN) and confirm it arrives.
- [ ] Test the failure path: temporarily set a wrong endpoint and confirm the visitor sees an error, not "Thank you".
- [ ] Add the processor (Web3Forms, Formspree, HubSpot, Make…) to the Privacy Policy recipients.
- [ ] Decide the retention period for enquiries (the Privacy Policy currently says 12 months; confirm).
