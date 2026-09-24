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
export type LeadProvider = 'disabled' | 'formspree' | 'web3forms' | 'hubspot' | 'webhook';

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

export const leads: LeadConfig = {
  provider: 'disabled',
  endpoint: '',
  accessKey: '',
  portalId: '',
  formGuid: '',
  subject: 'AIDEX.lv — jauns pieteikums',
  timeoutMs: 15000,
};

/** True when a destination is fully configured. */
export const leadsEnabled = () => {
  switch (leads.provider) {
    case 'formspree':
    case 'webhook': return /^https:\/\//.test(leads.endpoint);
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
