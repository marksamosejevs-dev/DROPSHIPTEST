/** Public production origin — canonical URLs, hreflang, sitemap and OpenGraph. */
export const SITE_URL = 'https://aidex.lv';

/**
 * Development markers ("Demo data", "Placeholder", "[to be confirmed]").
 * Hidden from visitors by default; build with PUBLIC_DEV_MARKERS=1 to show them
 * while reviewing which content is still temporary.
 */
export const SHOW_DEV_MARKERS = import.meta.env.PUBLIC_DEV_MARKERS === '1';
