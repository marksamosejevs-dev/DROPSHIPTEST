# Deploying AIDEX.lv to Netlify

Nothing has been deployed yet. Do the steps below only after you have approved publication and completed the items in `LAUNCH_CHECKLIST.md`.

## Settings already in the repository

`netlify.toml` (repository root) sets:

| Setting | Value |
|---|---|
| Base directory | `aidex-lv` |
| Build command | `npm run build` |
| Publish directory | `dist` (= `aidex-lv/dist`) |
| Node.js | `NODE_VERSION = 22` (Astro 7.3 requires ≥ 22.12; also `aidex-lv/.nvmrc` and `engines`) |
| Redirects | `/` → `/lv/` (301); removed calculator URLs `/lv/kalkulators/`, `/ru/kalkulyator/`, `/en/calculator/` → packages page (301) |
| Headers | `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, CSP `frame-ancestors/base-uri/object-src`, HSTS (1 year), immutable cache for `/_astro/*` |

**Leave Base directory, Build command and Publish directory empty in the Netlify UI.** `netlify.toml` provides them, and values typed in the UI can override it.

## 1. Connect the repository

1. Go to app.netlify.com → **Add new project → Import an existing project → GitHub**.
2. Authorise the Netlify GitHub app for `marksamosejevs-dev/DROPSHIPTEST`.
3. **Branch to deploy:** `claude/wizardly-gates-kes9a9`, or `main` if you first merge or rename the branch. The repository currently has no `main` branch.
4. Leave the build fields empty (see above) and click **Deploy**.
5. When the build is green, open the `*.netlify.app` URL and check it (see step 4 below).

## 2. Environment variables (Site configuration → Environment variables)

| Variable | When | Value |
|---|---|---|
| `PUBLIC_LEAD_PROVIDER` | optional | not needed for Netlify Forms (used automatically on Netlify builds); set only to use `web3forms` / `formspree` / `hubspot` / `webhook` instead |
| `PUBLIC_LEAD_ENDPOINT`, `PUBLIC_WEB3FORMS_ACCESS_KEY`, `PUBLIC_HUBSPOT_PORTAL_ID`, `PUBLIC_HUBSPOT_FORM_GUID` | only for the matching provider | public values only |
| `PUBLIC_DEV_MARKERS` | **never in production** | — |

For Netlify Forms: **Forms → Enable form detection** → redeploy → check that the form `aidex-request` is listed → **Form notifications → Email notification → `info@aidex-energy.com`**. Details are in `LEADS.md`.

## 3. Domains (aidex.lv and www.aidex.lv)

1. Go to **Domain management → Add a domain** and enter `aidex.lv`. Netlify also offers `www.aidex.lv`; add both.
2. Set `aidex.lv` as the **primary domain**, so `www` redirects to it. The canonical URLs on the site use `https://aidex.lv/`.
3. At your `.lv` domain registrar or DNS host, create the records Netlify shows. Usually these are:
   - `aidex.lv`: an **A** record to Netlify's load balancer IP (shown in the dashboard), or ALIAS/ANAME to the `*.netlify.app` host;
   - `www.aidex.lv`: a **CNAME** to `<your-site>.netlify.app`.

   Alternatively, use Netlify DNS by changing the nameservers.
4. Wait for DNS to propagate. Netlify then issues the Let's Encrypt certificate. Turn on **Force HTTPS**.

## 4. Verify the live site

Check these on `https://aidex.lv/`:

- [ ] `/` redirects to `/lv/`, and `www` redirects to the apex domain over HTTPS.
- [ ] Pages: `/lv/`, `/ru/`, `/en/`, `/lv/saules-panelu-komplekti/`, `/lv/saules-paneli/sunpro-power-sp440-n108m10/`.
- [ ] Packages show 6,16 / 7,92 / 10,12 kWp, 14 / 18 / 23 × SUNPRO POWER 440 W, and no prices.
- [ ] The request form: a test enquiry arrives (or, while not connected, the honest notice is shown).
- [ ] `https://aidex.lv/sitemap.xml` and `/robots.txt` load.
- [ ] Response headers include the security headers above.

So that Claude can verify the live site from a cloud session, allow `aidex.lv` and `www.aidex.lv` in that session's network settings.
