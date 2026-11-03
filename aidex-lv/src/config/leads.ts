/**
 * LEAD FORM DESTINATION — the single switch for where enquiries go.
 * ---------------------------------------------------------------------------
 * The site is static, so the browser posts the enquiry directly to the
 * configured service. Never put private API keys here (everything in this
 * file is public in the page source). See LEADS.md for what to provide.
 *
 *  provider      endpoint / ids                             success means
 *  ------------  -----------------------------------------  ----------------------------
 *  'disabled'    —                                          never (honest "not connected" message)
 *  'netlify'     — (Netlify Forms; no keys needed)           HTTP 2xx from Netlify (POST to the current page; site on Netlify
 *                                                          with Form detection enabled; see DEPLOY_NETLIFY.md)
 *  'formspree'   endpoint: 'https://formspree.io/f/xxxx'    HTTP 2xx and { ok: true }
 *  'web3forms'   accessKey: '<public access key>'           HTTP 2xx and { success: true }
 *  'hubspot'     portalId + formGuid                        HTTP 2xx
 *  'webhook'     endpoint: your CRM / Make / Zapier / own   HTTP 2xx (and not { ok: false })
 *                API URL accepting JSON POST (CORS on)
 *
 * The form shows the thank-you screen ONLY when the destination confirms it
 * received the enquiry. Any network error, non-2xx status or negative JSON
 * body shows an error and keeps what the visitor typed.
 */
export type LeadProvider = 'disabled' | 'netlify' | 'formspree' | 'web3forms' | 'hubspot' | 'webhook';

/**
 * Where enquiries should be delivered. Netlify Forms e-mails it via a form
 * notification set in the Netlify dashboard (Forms → aidex-request → Form
 * notifications); it is also the fallback link shown if sending fails.
 */
export const LEAD_EMAIL = 'info@aidex-energy.com';

/** Netlify Forms form name (all AIDEX request forms submit to this one form). */
export const NETLIFY_FORM_NAME = 'aidex-request';

export interface LeadConfig {
  provider: LeadProvider;
  /** formspree / webhook: full POST URL. */
  endpoint: string;
  /** web3forms: public access key (web3forms keys are designed to be public). */
  accessKey: string;
  /** hubspot: portal (hub) ID and form GUID. */
  portalId: string;
  formGuid: string;
  /** Subject line used by e-mail providers. */
  subject: string;
  /** Request timeout in ms before the visitor sees an error. */
  timeoutMs: number;
}

// The destination can be set in the hosting dashboard (build environment
// variables) without code changes. Only PUBLIC values belong here — they end
// up in the page source. Never put secret API keys in these variables.
const env = import.meta.env;
const PROVIDERS: LeadProvider[] = ['disabled', 'netlify', 'formspree', 'web3forms', 'hubspot', 'webhook'];
const envProvider = String(env.PUBLIC_LEAD_PROVIDER ?? '').trim() as LeadProvider;
// Netlify sets NETLIFY=true in its build environment. When the site is built
// there and no other provider is chosen, Netlify Forms is used automatically
// (no keys needed). Local/other builds stay 'disabled' (honest notice).
const builtOnNetlify = (globalThis as any).process?.env?.NETLIFY === 'true';

export const leads: LeadConfig = {
  provider: PROVIDERS.includes(envProvider) ? envProvider : builtOnNetlify ? 'netlify' : 'disabled',
  endpoint: String(env.PUBLIC_LEAD_ENDPOINT ?? ''),
  accessKey: String(env.PUBLIC_WEB3FORMS_ACCESS_KEY ?? ''),
  portalId: String(env.PUBLIC_HUBSPOT_PORTAL_ID ?? ''),
  formGuid: String(env.PUBLIC_HUBSPOT_FORM_GUID ?? ''),
  subject: 'AIDEX.lv — jauns pieteikums',
  timeoutMs: 15000,
};

/** True when a destination is fully configured. */
export const leadsEnabled = () => {
  switch (leads.provider) {
    case 'formspree':
    case 'webhook': return /^https:\/\//.test(leads.endpoint);
    case 'netlify': return true;
    case 'web3forms': return !!leads.accessKey;
    case 'hubspot': return !!leads.portalId && !!leads.formGuid;
    default: return false;
  }
};

/** Public, browser-safe subset passed to the form script. */
export const leadClientConfig = () => ({
  provider: leadsEnabled() ? leads.provider : 'disabled',
  endpoint: leads.endpoint,
  accessKey: leads.accessKey,
  portalId: leads.portalId,
  formGuid: leads.formGuid,
  subject: leads.subject,
  timeoutMs: leads.timeoutMs,
});
