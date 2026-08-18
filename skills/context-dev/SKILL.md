---
name: context-dev
description: Build application code directly against the Context.dev REST API or SDKs with server-side API-key authentication. Use when the user asks to integrate Context.dev into a codebase, choose an SDK method or REST endpoint, debug an API request, or implement a backend Context.dev workflow. For ordinary live-web work inside Cursor, use the focused Context.dev MCP skills instead.
license: MIT
metadata:
  author: context.dev
  version: "3.1"
---

# Context.dev

Context.dev turns any domain or URL into structured, typed JSON: brand profiles, design systems, scraped content, extracted products, industry codes, and merchant identity. Base URL `https://api.context.dev/v1`. Full docs: [docs.context.dev](https://docs.context.dev) · machine index: [docs.context.dev/llms.txt](https://docs.context.dev/llms.txt).

Every endpoint takes one bearer token and returns typed JSON. No HTML parsing, no Open Graph scraping. This file tells you which endpoint answers which question, exactly what each takes, and exactly what each gives back.

## Setup

Authenticate with a bearer token read from `CONTEXT_DEV_API_KEY`. Never hardcode it; never ship it to client-side code (use a backend proxy).

```bash
export CONTEXT_DEV_API_KEY="ctxt_secret_..."
```

Install an SDK, or call REST directly with `curl`:

| Language   | Install                                            | Import                                                          |
| ---------- | -------------------------------------------------- | --------------------------------------------------------------- |
| TypeScript | `npm install context.dev`                          | `import ContextDev from "context.dev"`                          |
| Python     | `pip install context.dev`                          | `from context.dev import ContextDev`                            |
| Ruby       | `gem install context.dev`                          | `require "context_dev"`                                         |
| Go         | `go get github.com/context-dot-dev/context-go-sdk` | `import contextdev "github.com/context-dot-dev/context-go-sdk"` |
| PHP        | `composer require context-dev/context-dev-php`   | `use ContextDev\Client;`                                        |

```typescript
import ContextDev from "context.dev";
const client = new ContextDev({ apiKey: process.env.CONTEXT_DEV_API_KEY });
const { brand } = await client.brand.retrieve({ type: "by_domain", domain: "stripe.com" });
```

**SDK naming.** Methods below are shown in TypeScript camelCase (`client.brand.retrieve`). Python and Ruby use snake_case (`retrieve`); PHP uses the same camelCase method names as TypeScript with named parameters (`$client->brand->retrieve(type: 'by_domain', domain: 'stripe.com')`); Go uses PascalCase and renames a few (`client.Brand.Get`, `client.Industry.GetNaics`). Methods are grouped under five namespaces that don't always match the URL path: `brand.*`, `web.*`, `ai.*`, `industry.*` (NAICS/SIC, despite `/web/` paths), `utility.*` (prefetch). The Python SDK currently lags the others: a few methods live under different namespaces (`client.style.*` for styleguide/fonts) or are missing; if an SDK method is missing or unavailable, call the REST path directly. See [best practices](https://docs.context.dev/optimization/best-practices).

## Choosing an endpoint

Pick the narrowest endpoint that answers the question. Start from what you already have:

| You have                          | Use                                              | Path                                                              |
| --------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| A domain, want everything         | Retrieve Brand                                   | `POST /brand/retrieve` with `type: "by_domain"`                   |
| A domain, only need logo + colors | Retrieve Simplified (same price, smaller/faster) | `GET /brand/retrieve-simplified`                                  |
| A company name                    | Retrieve by Name                                 | `POST /brand/retrieve` with `type: "by_name"`                     |
| A work email                      | Retrieve by Email                                | `POST /brand/retrieve` with `type: "by_email"`                    |
| A stock ticker                    | Retrieve by Ticker                               | `POST /brand/retrieve` with `type: "by_ticker"`                   |
| An ISIN                           | Retrieve by ISIN                                 | `GET /brand/retrieve-by-isin`                                     |
| A card/bank descriptor            | Brand transaction lookup                         | `POST /brand/retrieve` with `type: "by_transaction"`              |
| A person's email, name, or social profile URL | Enrich Person (beta)                 | `POST /people/enrich`                                             |
| A specific page URL you want scraped for brand fields | Retrieve by direct URL                | `POST /brand/retrieve` with `type: "by_direct_url"`               |
| A URL → clean text for an LLM     | Scrape Markdown                                  | `GET /web/scrape/markdown`                   |
| A whole site → text for RAG       | Crawl                                            | `POST /web/crawl`                            |
| A design system to copy/theme     | Styleguide                                       | `GET /web/styleguide`                        |
| A product page → structured data  | Extract Product                                  | `POST /brand/ai/product`                     |
| A custom schema for a site        | Structured Extract                               | `POST /web/extract`                          |
| An industry code (NAICS/SIC)      | Classify                                         | `GET /web/naics` · `/web/sic`                |

**Prefer bare domains:** use `stripe.com` instead of `https://stripe.com` or `www.stripe.com`. The API normalizes protocol and `www.`, but a string with no TLD fails validation.

---

## Brand intelligence

Brand lookups share the same response envelope: `{ status, code, brand }`. They cost **10 credits** each and only bill on a successful resolution (a 400 `NOT_FOUND` "no brand" response is free). Guide: [Get brand data](https://docs.context.dev/guides/get-brand-data).

### The `brand` object (shared response shape)

This is what `brand` contains on full Brand responses from `POST /brand/retrieve`, including domain, name, email, ticker, ISIN, and transaction lookups. Any field may be `null`/absent, so always provide fallbacks.

| Field                         | Type         | Notes                                                                                                                                                                                                                              |
| ----------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand.domain`                | string       | Canonical domain after normalization.                                                                                                                                                                                              |
| `brand.title`                 | string       | Company name.                                                                                                                                                                                                                      |
| `brand.description`           | string       | One-paragraph description.                                                                                                                                                                                                         |
| `brand.slogan`                | string       | Tagline.                                                                                                                                                                                                                           |
| `brand.colors[]`              | array        | `{ hex, name }`, ordered by prominence. `name` is generated, not official; key off `hex`.                                                                                                                                          |
| `brand.logos[]`               | array        | `{ url, mode, type, resolution{width,height,aspect_ratio}, colors[] }`. `mode` ∈ `light` / `dark` / `has_opaque_background`; `type` ∈ `icon` (square) / `logo` (horizontal). **Filter by `mode`+`type`; don't assume `logos[0]`.** |
| `brand.backdrops[]`           | array        | Hero imagery: `{ url, colors[], resolution }`.                                                                                                                                                                                     |
| `brand.socials[]`             | array        | `{ type, url }`. `type` ∈ x, facebook, instagram, linkedin, youtube, tiktok, github, +24 more.                                                                                                                                     |
| `brand.address`               | object       | `street, city, state_province, state_code, country, country_code, postal_code`.                                                                                                                                                    |
| `brand.stock`                 | object\|null | `{ ticker, exchange }`. `null` for private companies.                                                                                                                                                                              |
| `brand.employees`             | object\|null | `{ range, exact }`. `range` is a bucket from `1 to 10` through `10001+`; `exact` is the precise headcount when known. `null` when unknown.                                                                                          |
| `brand.industries.eic[]`      | array        | `{ industry, subindustry }`: Context's own taxonomy ([EIC](https://docs.context.dev/guides/classification/EIC)), inline on every full response. For NAICS/SIC use the dedicated endpoints.                                         |
| `brand.links`                 | object       | `careers, blog, pricing, contact, terms, privacy`, each nullable.                                                                                                                                                                  |
| `brand.email` / `brand.phone` | string       | Public contact info, when found.                                                                                                                                                                                                   |
| `brand.primary_language`      | string\|null | Detected site language.                                                                                                                                                                                                            |
| `brand.is_nsfw`               | boolean      | Safe-content flag.                                                                                                                                                                                                                 |

```json
{
  "status": "ok",
  "code": 200,
  "brand": {
    "domain": "stripe.com",
    "title": "Stripe",
    "colors": [{ "hex": "#543cfb", "name": "Meteor Shower" }],
    "logos": [
      {
        "url": "https://media.brand.dev/….svg",
        "mode": "light",
        "type": "logo",
        "resolution": { "width": 150, "height": 48, "aspect_ratio": 3.13 }
      }
    ],
    "industries": {
      "eic": [
        { "industry": "Finance", "subindustry": "Payments & Money Movement" }
      ]
    },
    "stock": null
  }
}
```

### Retrieve brand by domain

`POST /brand/retrieve` with `type: "by_domain"` · 10 credits · SDK `client.brand.retrieve` (Go `Brand.Get`)
[Guide](https://docs.context.dev/guides/get-brand-data#get-a-brand-by-domain) · [API reference](https://docs.context.dev/api-reference/brand-intelligence/retrieve-brand-data-by-domain)

- **When:** you have the company's website domain and want the full profile (logos, colors, socials, address, industry, stock).
- **Takes (JSON body):** `type: "by_domain"` (**required** discriminator), `domain` (string, **required**, bare domain). Optional: `maxSpeed` (bool; skip slow steps for a faster, lighter answer), `force_language` ([SupportedLanguage](https://docs.context.dev/guides/get-brand-data) enum), `maxAgeMs` (int, default `7776000000` ≈ 90d, clamped 1d–1y), `timeoutMS` (int, max `300000`).
- **Gives:** the shared `{ status, code, brand }` envelope above.

### Retrieve simplified

`GET /brand/retrieve-simplified` · 10 credits · SDK `client.brand.retrieveSimplified` (Go `Brand.GetSimplified`)
[Guide](https://docs.context.dev/guides/get-brand-data#get-a-brand-by-domain) · [API reference](https://docs.context.dev/api-reference/brand-intelligence/retrieve-simplified-brand-data-by-domain)

- **When:** you have a domain and only need lightweight visual assets. Fastest payload for logo walls, signup pre-fill, or theming.
- **Takes:** `domain` (string, **required**), `theme` (`light`|`dark`; selects matching assets), `maxAgeMs`, `timeoutMS`. No name/email/ticker/`maxSpeed`/`force_language`.
- **Gives:** `{ status, code, brand }` where `brand` is **stripped to `domain`, `title`, `colors[]`, `logos[]`, `backdrops[]` only**: no description, socials, address, stock, industries, or links. Same 10-credit price as the full retrieve, just less data.

### Retrieve by company name

`POST /brand/retrieve` with `type: "by_name"` · 10 credits · SDK `client.brand.retrieve` (Go `Brand.Get`)
[Guide](https://docs.context.dev/guides/get-brand-data#look-up-by-company-name) · [API reference](https://docs.context.dev/api-reference/brand-intelligence/brand)

- **When:** you only know the company name and need Context to resolve it to a domain + full profile.
- **Takes (JSON body):** `type: "by_name"` (**required**), `name` (string, **required**, 3–30 chars). Optional: `country_gl` (ISO 3166-1 alpha-2 hint to disambiguate, e.g. `us`), `maxSpeed`, `force_language`, `maxAgeMs`, `timeoutMS`.
- **Gives:** the full shared `brand` envelope.

### Retrieve by work email

`POST /brand/retrieve` with `type: "by_email"` · 10 credits · SDK `client.brand.retrieve` (Go `Brand.Get`)
[Guide](https://docs.context.dev/guides/get-brand-data#look-up-by-work-email) · [API reference](https://docs.context.dev/api-reference/brand-intelligence/brand)

- **When:** lead/onboarding enrichment from a work email; the domain is extracted automatically.
- **Takes (JSON body):** `type: "by_email"` (**required**), `email` (string, **required**). Optional: `maxSpeed`, `force_language`, `maxAgeMs`, `timeoutMS`.
- **Gives:** the full shared `brand` envelope.
- **Note:** free providers (gmail, outlook…) and disposable addresses return **HTTP 422** (`FREE_EMAIL_DETECTED` / `DISPOSABLE_EMAIL_DETECTED`); handle 422 as "skip enrichment", not a hard error.

### Retrieve by ticker

`POST /brand/retrieve` with `type: "by_ticker"` · 10 credits · SDK `client.brand.retrieve` (Go `Brand.Get`)
[Guide](https://docs.context.dev/guides/get-brand-data#look-up-by-stock-ticker) · [API reference](https://docs.context.dev/api-reference/brand-intelligence/brand)

- **When:** investor/finance flows keyed on a listed ticker.
- **Takes (JSON body):** `type: "by_ticker"` (**required**), `ticker` (string, **required**, 1–15 chars, e.g. `AAPL`, `BRK.A`). Optional `ticker_exchange` (**defaults to NASDAQ**; set it for non-NASDAQ listings), plus `maxSpeed`/`force_language`/`maxAgeMs`/`timeoutMS`.
- **Gives:** the full shared `brand` envelope, with `brand.stock` populated.

### Retrieve by ISIN

`GET /brand/retrieve-by-isin` · 10 credits · SDK `client.brand.retrieveByIsin` (Go `Brand.GetByIsin`)
[Guide](https://docs.context.dev/guides/get-brand-data#look-up-by-isin) · [API reference](https://docs.context.dev/api-reference/brand-intelligence/retrieve-brand-data-by-isin)

- **When:** you're joining against financial feeds keyed on ISIN. Ticker lookups are the common path; ISIN is the niche/hidden one.
- **Takes:** `isin` (string, **required**, exactly 12 chars `^[A-Z]{2}[A-Z0-9]{9}[0-9]$`, e.g. `US0378331005`), plus `maxSpeed`/`force_language`/`maxAgeMs`/`timeoutMS`.
- **Gives:** the full shared `brand` envelope, with `brand.stock` populated.

### Transaction enrichment

`POST /brand/retrieve` with `type: "by_transaction"` · 10 credits · SDK `client.brand.retrieve`
[Guide](https://docs.context.dev/guides/enrich-transaction-codes) · [API reference](https://docs.context.dev/api-reference/brand-intelligence/brand)

- **When:** you have a messy card/ACH descriptor (`AMZN MKTP US`, `SQ *COFFEE BAR`) and need the real merchant brand for spend analytics or categorization.
- **Takes (JSON body):** `type: "by_transaction"` (**required**), `transaction_info` (string, **required**). Optional disambiguators sharply improve accuracy: `mcc` (4-digit category code), `city`, `country_gl` (ISO alpha-2), `phone` (number), `high_confidence_only` (bool, default false; set true for fewer false matches), `maxSpeed`, `force_language`, `timeoutMS`.
- **Gives:** the full shared `brand` envelope (the identified merchant).
- **Note:** this is the only brand lookup that does **not** accept `maxAgeMs`.

### Retrieve by direct URL

`POST /brand/retrieve` with `type: "by_direct_url"` · 10 credits · SDK `client.brand.retrieve` (Go `Brand.Get`)
[Guide](https://docs.context.dev/guides/get-brand-data#look-up-by-direct-url) · [API reference](https://docs.context.dev/api-reference/brand-intelligence/brand)

- **When:** you want brand fields scraped from **one specific page** — a subpath, landing page, preview URL, or a domain the database doesn't cover yet. Fetches only that URL; no domain resolution, DB lookup, or cross-source enrichment.
- **Takes (JSON body):** `type: "by_direct_url"` (**required**), `direct_url` (string, **required**, full http(s) URL). Optional: `timeoutMS`. Rejects `maxSpeed`, `force_language`, and `maxAgeMs` — those would be silently ignored by the single-page scrape flow.
- **Gives:** the shared `brand` envelope, but only fields extractable from the page: `domain`, `title`, `description`, `logos` (URLs only), `socials`, `email`, `phone`, `links`. Enrichment-only fields (`colors`, `backdrops`, `industries`, `stock`, `address`) are omitted.
- **Note:** unreachable URLs return `400` `WEBSITE_ACCESS_ERROR` (or `WEBSITE_NOT_FOUND` when the domain doesn't resolve at all).

---

## Web scraping

Render, crawl, and search the live web. Bot-detection bypass and proxy escalation are automatic. Guide: [Scrape websites](https://docs.context.dev/guides/scrape-websites-to-markdown).

### Scrape Markdown

`GET /web/scrape/markdown` · 1 credit · SDK `client.web.webScrapeMd` (Go `Web.WebScrapeMd`)
[Guide](https://docs.context.dev/guides/scrape-websites-to-markdown#scrape-a-single-page-to-markdown) · [API reference](https://docs.context.dev/api-reference/web-scraping/scrape-markdown)

- **When:** turn one page into clean, LLM-ready GitHub-Flavored Markdown (nav/ads stripped). The default for feeding pages to a model.
- **Takes:** `url` (string URI, **required**). Optional: `includeLinks` (default true), `includeImages` (default false), `shortenBase64Images` (default true), `useMainContentOnly` (default false), `includeHTML` (default false; adds the source HTML beside the Markdown), `includeFrames` (default false), `includeSelectors[]`/`excludeSelectors[]` (CSS selectors to keep/remove before conversion; exclusion wins), `pdf` object (`shouldParse` default true, `start`/`end` page range, `ocr` default false — OCRs scanned pages at **1 credit per recovered page**; a scan with `ocr` off returns `400 PDF_IMAGES_ONLY`), `maxAgeMs` (default 1d, 0–30d), `waitForMs` (0–30000 render wait), `settleAnimations`, `country`, `actions[]` (up to 5 ordered `{do: "wait", timeMs}` / `{do: "perform", action}` steps; **paid plan only, 2 credits, bypasses cache**), `headers` object (forwarded to the target URL; bypasses cache), `timeoutMS`.
- **Gives:** `{ success: true, markdown, html?, contentLength, url, metadata }`. `metadata.headings[]` contains `{ level, text }` entries in document order when headings are present.

### Scrape HTML

`GET /web/scrape/html` · **1 credit (2 with `actions`)** · SDK `client.web.webScrapeHTML` (Go `Web.WebScrapeHTML`)
[Guide](https://docs.context.dev/guides/scrape-websites-to-markdown#scrape-a-single-page-to-markdown) · [API reference](https://docs.context.dev/api-reference/web-scraping/scrape-html)

- **When:** you need the fully-rendered raw HTML (to parse the DOM, attributes, or scripts) instead of cleaned text.
- **Takes:** `url` (**required**), `pdf`, `includeFrames`, `useMainContentOnly`, `includeSelectors[]`/`excludeSelectors[]`, `maxAgeMs`, `waitForMs`, `settleAnimations`, `country`, `actions[]` (paid plan only, 2 credits, bypasses cache; same shape as Scrape Markdown), `headers`, `timeoutMS` (same shapes as Scrape Markdown).
- **Gives:** `{ success: true, html, url, type, metadata }`. `metadata.headings[]` is present when headings were found.

### Scrape Markdown / HTML with actions

Attach `actions` to `/web/scrape/markdown` or `/web/scrape/html` when the page only reveals its content after interaction (cookie banners, "Load more" buttons, tab switches). Up to **5 ordered actions** run after page load and before capture. Each is a discriminated object: `{do: "wait", timeMs: <0–30000>}` or `{do: "perform", action: "<natural-language instruction, ≤500 chars>"}`. **Paid plan required** — free-tier keys get `403 PAID_PLAN_REQUIRED`. Any action bumps the call to **2 credits** (5 for enriched images) and bypasses the scrape cache and HTML/PDF fast paths.

### Scrape Images

`GET /web/scrape/images` · **1 credit · 2 with `actions` · 5 if any enrichment flag is set** · SDK `client.web.webScrapeImages` (Go `Web.WebScrapeImages`)
[Guide](https://docs.context.dev/guides/scrape-websites-to-markdown#extract-every-image-on-a-page) · [API reference](https://docs.context.dev/api-reference/web-scraping/scrape-images)

- **When:** enumerate every image on a page (`img`, inline SVG, CSS backgrounds, video posters, data URIs) and optionally measure / classify / CDN-host them.
- **Takes:** `url` (**required**), `maxAgeMs`, `dedupe` (perceptually remove near-duplicates), `waitForMs`, `actions[]` (paid plan only, 2 credits, bypasses cache; same shape as Scrape Markdown — enriched calls stay at 5 credits), `headers` (forwarded to the target URL; bypasses cache), `timeoutMS`, and an `enrichment` object: `resolution` (bool), `hostedUrl` (bool), `classification` (bool), `maxTimePerMs` (int). **Enabling any enrichment flag makes the whole call cost 5 credits** (not per-image).
- **Gives:** `{ success, images[], url }`. Each image: `{ src, element (img|svg|css|background|…), type (url|html|base64), alt|null, enrichment{ width, height, mimetype, url, type(photography|illustration|logo|wordmark|icon|…) } }`. The `enrichment` sub-fields populate only for the flags you requested.

### Crawl Sitemap

`GET /web/scrape/sitemap` · **1 credit (2 with `search`)** · SDK `client.web.webScrapeSitemap` (Go `Web.WebScrapeSitemap`)
[Guide](https://docs.context.dev/guides/scrape-websites-to-markdown#get-all-urls-of-a-domain) · [API reference](https://docs.context.dev/api-reference/web-scraping/crawl-sitemap)

- **When:** discover the URL inventory of a domain (cheap, no page content) before deciding what to scrape or crawl.
- **Takes:** `domain` (string, **required**, bare domain, not a URL). Optional: `maxLinks` (default 10000, 1–100000), `urlRegex` (RE2, ≤256 chars, filters which URLs return), `search` (string, 2–200 chars; filters the crawled sitemap to the pages about that phrase, e.g. `pricing and plans`, most relevant first — bumps the call to **2 credits**), `headers` (forwarded to the target URL; bypasses cache), `timeoutMS`.
- **Gives:** `{ success, domain, urls[], meta{ sitemapsDiscovered, sitemapsFetched, sitemapsSkipped, errors } }`. Returns URLs only; it does not fetch page content despite the "Crawl" name. With `search` set, `urls[]` contains only the matching pages, most relevant first.

### Crawl Website

`POST /web/crawl` · **1 credit per page** · SDK `client.web.webCrawlMd` (Go `Web.WebCrawlMd`)
[Guide](https://docs.context.dev/guides/scrape-websites-to-markdown#crawl-a-whole-site) · [API reference](https://docs.context.dev/api-reference/web-scraping/crawl-website-&-scrape-markdown)

- **When:** traverse a site from a seed URL and collect every page's Markdown in one call, e.g. ingesting a docs site or blog into RAG.
- **Takes (JSON body):** `url` (**required**). Optional: `maxPages` (default 100, **hard cap 500**), `maxDepth`, `urlRegex` (limit which links to follow), `followSubdomains` (default false), `includeLinks`/`includeImages`/`shortenBase64Images`/`useMainContentOnly`, `includeSelectors[]`/`excludeSelectors[]`, `pdf`, `includeFrames`, `maxAgeMs`, `waitForMs`, `settleAnimations`, `country`, `stopAfterMs` (soft budget, default 80000, range 10000–110000, returns partial results early), `timeoutMS` (hard abort).
- **Gives:** `{ results[], metadata }`. Each result: `{ markdown, metadata{ url, title, crawlDepth, statusCode, success } }`. Top-level `metadata`: `{ numUrls, maxCrawlDepth, numSucceeded, numFailed, numSkipped }`. Failed pages appear with empty `markdown` and `success: false`; skipped URLs are counted but omitted. **Billed per page crawled**, so set `maxPages` conservatively.

### Web Search

`POST /web/search` · **1 credit per 10 results** · SDK `client.web.search` (Go `Web.Search`)
[Guide](https://docs.context.dev/guides/scrape-websites-to-markdown) · [API reference](https://docs.context.dev/api-reference/web-scraping/web-search)

- **When:** find relevant pages for a natural-language query across the web (optionally scraping each hit to Markdown in the same round-trip) and you don't already have a URL.
- **Takes (JSON body):** `query` (string, **required**, 1–500 chars). Optional: `includeDomains[]`, `excludeDomains[]`, `freshness` (`last_24_hours`|`last_week`|`last_month`|`last_year`), `queryFanout` (bool), `markdownOptions` (off by default; set `enabled: true` to scrape each result, with the same markdown sub-options as Scrape Markdown), `timeoutMS`.
- **Gives:** `{ results[], query }`. Each result: `{ url, title, description, relevance (high|medium|low), markdown{ markdown|null, code } }`. **Always check `markdown.code` first**: `NOT_REQUESTED` (scraping off), `SUCCESS`, `TIMEOUT`, `CONTENT_TOO_LARGE` (result page over the 20 MB cap), `WEBSITE_ACCESS_ERROR`, `ERROR`; only `SUCCESS` guarantees non-null markdown.

---

## Design system

Extract a site's visual system to reproduce or theme on-brand. XOR rule: pass **exactly one** of `domain` or `directUrl` (omitting both → 400). Guide: [Extract a design system](https://docs.context.dev/guides/extract-design-system-from-website).

### Styleguide

`GET /web/styleguide` · 10 credits · SDK `client.web.extractStyleguide` (Go `Web.ExtractStyleguide`; Python `client.style.extract_styleguide`)
[Guide](https://docs.context.dev/guides/extract-design-system-from-website#extract-the-full-styleguide) · [API reference](https://docs.context.dev/api-reference/web-extraction/scrape-styleguide)

- **When:** you need the full design system: palette, type scale, spacing, shadows, and paste-ready button/card CSS.
- **Takes:** `domain` **or** `directUrl` (one required), `colorScheme` (`light`|`dark`; emulates `prefers-color-scheme` and is included in the cache key), `maxAgeMs` (default `7776000000` ≈ 90d, clamped 1d–1y), `timeoutMS`.
- **Gives:** `{ status, domain, code, styleguide }` where `styleguide` =
  - `mode` (`light`|`dark`)
  - `colors` `{ accent, background, text }` (hex)
  - `typography.headings.{h1..h4}` and `typography.p`, each `{ fontFamily, fontFallbacks[], fontSize, fontWeight, lineHeight, letterSpacing }`
  - `elementSpacing` `{ xs, sm, md, lg, xl }`
  - `shadows` `{ sm, md, lg, xl, inner }`
  - `components.button.{primary,secondary,link}` and `components.card`; each carries a precomputed **`css`** string you can paste directly (note card uses `textColor`, buttons use `color`)
  - `fontLinks`: map of family → `{ type (google|custom), files{ "400": url, "700": url, … }, category, displayName }`; may be `{}` when no families resolve to downloadable URLs.

### Fonts

`GET /web/fonts` · 5 credits · SDK `client.web.extractFonts` (Go `Web.ExtractFonts`; Python `client.style.extract_fonts`)
[Guide](https://docs.context.dev/guides/extract-design-system-from-website#extract-just-the-fonts) · [API reference](https://docs.context.dev/api-reference/web-extraction/scrape-fonts)

- **When:** you only need typography: which families a site uses, fallbacks, dominance, and downloadable file URLs.
- **Takes:** `domain` **or** `directUrl` (one required), `maxAgeMs` (default `7776000000` ≈ 90d, clamped 1d–1y), `timeoutMS`.
- **Gives:** `{ status, domain, code, fonts[], fontLinks? }`. Each font: `{ font, uses[], fallbacks[], num_elements, num_words, percent_elements, percent_words }` (word % = text volume, element % = DOM coverage; a mono font can dominate elements but carry few words). `fontLinks` is omitted entirely when nothing resolves.

---

## Screenshots

### Capture Screenshot

`GET /web/screenshot` · 1 credit · SDK `client.web.screenshot` (Go `Web.Screenshot`)
[Guide](https://docs.context.dev/guides/take-webpage-screenshot) · [API reference](https://docs.context.dev/api-reference/web-scraping/scrape-screenshot)

- **When:** a rendered PNG of a page, for link previews, share cards, or visual archives.
- **Takes:** `domain` **or** `directUrl` (one required, XOR). Optional: `fullScreenshot` (**string** `"true"`/`"false"`, not a JSON bool), `handleCookiePopup` (boolean, default `false`), `colorScheme` (`light`|`dark`), `viewport` object `{ width 240–7680 default 1920, height 240–4320 default 1080 }`, `scrollOffset` (integer 0–100000; takes precedence over `fullScreenshot`), `page` (enum `login|signup|blog|careers|pricing|terms|privacy|contact`; auto-finds that page type; **only works with `domain`**, ignored with `directUrl`), `country` (ISO 3166-1 alpha-2), `maxAgeMs`, `waitForMs` (default 3000), `timeoutMS`.
- **Gives:** `{ status, domain, screenshot, screenshotType (viewport|fullPage), width, height, code }`. `screenshot` is a hosted public image URL, not inline bytes.

---

## AI extraction

LLM-backed structured extraction. All 10 credits, `POST` with JSON body. SDK namespace is `client.ai.*` for the product endpoints and `client.web.*` for structured web extraction (`/web/extract`).

### Extract a single product

`POST /brand/ai/product` · 10 credits · SDK `client.ai.extractProduct` (Go `AI.ExtractProduct`)
[Guide](https://docs.context.dev/guides/extract-product-from-websites) · [API reference](https://docs.context.dev/api-reference/web-extraction/extract-a-single-product-from-a-url)

- **When:** you have one product-page URL and want its structured details.
- **Takes:** `url` (string URI, **required**), `maxAgeMs` (default 7d, 0–30d), `timeoutMS`.
- **Gives:** `{ is_product_page, platform (amazon|tiktok_shop|etsy|generic|null), product|null }`. `product`: `{ name, description, price|null, currency|null, billing_frequency(monthly|yearly|one_time|usage_based)|null, pricing_model(per_seat|flat|tiered|freemium|custom)|null, url, category|null, features[], target_audience[], tags[], image_url|null, images[], sku|null }`.
- **Note:** `product` and `platform` can be `null` even when `is_product_page` is `true`, so **branch on both**. Pages we couldn't reach (blocked, WAF, timeout) and listing/category grids return `400 WEBSITE_ACCESS_ERROR` — not a silent `is_product_page: false`.

### Extract products from a site

`POST /brand/ai/products` · 10 credits · **Beta** · SDK `client.ai.extractProducts` (Go `AI.ExtractProducts`)
[Guide](https://docs.context.dev/guides/extract-product-from-websites) · [API reference](https://docs.context.dev/api-reference/web-extraction/extract-products-from-a-brands-website)

- **When:** discover and extract a brand's product list from its site.
- **Takes (JSON body):** `domain` **or** `directUrl` (exactly one, XOR; both or neither → 400). Optional `maxProducts` (1–12), `maxAgeMs`, `timeoutMS`. (Ruby: `extract_products(body: { domain: … })`; Go: `OfByDomain`.)
- **Gives:** `{ products[] }`, each product the same shape as `/brand/ai/product`'s `product`. `images[]` may be omitted for non-physical products (SaaS).

### Structured web extraction

`POST /web/extract` · 10 credits · SDK `client.web.extract` (Go `Web.Extract`)
[Guide](https://docs.context.dev/guides/extract-structured-data-from-websites) · [API reference](https://docs.context.dev/api-reference/web-extraction/query-website-data-using-ai)

- **When:** extract arbitrary caller-defined data from a site with a JSON Schema. Replaces a scrape-many-pages-then-LLM pipeline.
- **Takes (JSON body):** `url` (**required**) and `schema` (**required**). Optional `instructions`, `maxPages` (1–50, default 5), `maxDepth`, `factCheck`, `followSubdomains`, `pdf`, `includeFrames`, `maxAgeMs` (default 7d), `waitForMs`, `stopAfterMs` (soft crawl budget, default 80000), and `timeoutMS`.
- **Gives:** `{ data, urls_analyzed[], metadata }`, where `data` matches the schema you sent.
- **Legacy:** `POST /brand/ai/query` remains available for older integrations, but prefer `/web/extract` for new structured extraction work.

---

## Industry classification

Dedicated code lookups. **SDK namespace is `client.industry.*`, not `web.*`**, despite the `/web/` path. Both 10 credits, `GET`. Overview: [Classification](https://docs.context.dev/guides/classification/overview).

### NAICS

`GET /web/naics` · 10 credits · SDK `client.industry.retrieveNaics` (Go `Industry.GetNaics`)
[Guide](https://docs.context.dev/guides/classification/NAICS) · [API reference](https://docs.context.dev/api-reference/web-extraction/classify-naics-industries)

- **When:** you need 2022 NAICS codes for regulatory reporting or TAM segmentation.
- **Takes:** `input` (string, **required**; a domain is preferred, a free-text name also works), `minResults` (1–10, default 1), `maxResults` (1–10, default 5), `timeoutMS`.
- **Gives:** `{ status, domain, type, codes[] }`, each code `{ code, name, confidence (high|medium|low) }`.

### SIC

`GET /web/sic` · 10 credits · SDK `client.industry.retrieveSic` (Go `Industry.GetSic`)
[Guide](https://docs.context.dev/guides/classification/SIC) · [API reference](https://docs.context.dev/api-reference/web-extraction/classify-sic-industries)

- **When:** SEC filings, tax/accounting, or legacy systems that still speak SIC.
- **Takes:** `input` (**required**), `type` (`original_sic` default | `latest_sec`; picks the dataset), `minResults`/`maxResults` (1–10), `timeoutMS`.
- **Gives:** `{ status, domain, type, classification, codes[] }`. `original_sic` codes carry `majorGroup` + `majorGroupName`; `latest_sec` codes carry `office`. Each code also has `code`, `name`, `confidence`.

---

## People enrichment

### Enrich Person

`POST /people/enrich` · 20 credits · **Beta, paid plans only** · SDK `client.people.enrich`
[API reference](https://docs.context.dev/api-reference/people/enrich)

- **When:** you have identity clues for a person — a social profile URL, a work email, or a name plus company/education/location — and want one normalized profile with a confidence score.
- **Takes (JSON body):** any combination of `social_urls[]` (1–20 profile URLs), `name` (`{ first, last }`), `email`, `company` (`{ name, domain }`), `education[]` (`{ institution{name,domain}, degree, field_of_study, graduation_year }`), `location` (`{ city, region, country }`), plus `timeoutMS` and `tags`. All supplied clues are considered together — more clues, better match.
- **Gives:** `{ match, key_metadata }`. `match` is a discriminated union on `status`: `{ status: "candidate", score (0–100), person{ name{full,first,last}, email, avatar_url, bio, location, social_urls[], website_urls[], current_role{title, organization{name,domain}, location} } }` or `{ status: "not_found", score: null, person: null }`. **Branch on `match.status`** and treat low `score` values as weak matches.
- **Note:** free-provider and disposable emails return **422** (`FREE_EMAIL_DETECTED` / `DISPOSABLE_EMAIL_DETECTED`) before any credits are charged — handle as "skip enrichment". Free-tier keys get 403; every paid plan has access.

---

## Prefetch (cache warming)

Free, no rate limit, **paid-subscriber only** (403 `FORBIDDEN` otherwise). Fire-and-forget: the 200 only confirms that work was queued; it returns no brand or styleguide payload. Guide: [Prefetching](https://docs.context.dev/optimization/prefetching).

### Prefetch brand data or a styleguide

`POST /utility/prefetch` · 0 credits · SDK `client.utility.prefetch` (Go `Utility.Prefetch`)
[API reference](https://docs.context.dev/api-reference/utility/prefetch)

- **When:** you know a domain or work email ahead of when you'll need brand data or a website styleguide and want the later read to land on a warm cache.
- **Takes:** `type: "brand" | "styleguide"` (**required**), `identifier.domain` or `identifier.email` (exactly one required; both or neither returns **400**), `timeoutMS`. Use `brand` before `/brand/retrieve` and `styleguide` before `/web/styleguide`. **Gives:** `{ status, message, type, domain, key_metadata }`.
- **Note:** email identifiers extract the domain automatically; free/disposable emails return **422** (`FREE_EMAIL_DETECTED` / `DISPOSABLE_EMAIL_DETECTED`).

### Legacy prefetch endpoints

`POST /brand/prefetch` and `POST /brand/prefetch-by-email` still work unchanged for existing integrations. New integrations should use `POST /utility/prefetch`.

- **Domain takes:** `domain` (string, **required**), `timeoutMS`. **Gives:** `{ status, message, domain }`.
- **Email takes:** `email` (string, **required**), `timeoutMS`. **Gives:** `{ status, message, domain }` (the extracted domain).
- **Note:** legacy email prefetch returns **422** (`FREE_EMAIL_DETECTED` / `DISPOSABLE_EMAIL_DETECTED`) for free or disposable providers.

---

## Latency

Cached brand lookups return in **under 1 second** (~60% of calls hit the cache). A cold lookup runs a full crawl: **p50 ≈ 7s, p90 ≈ 18s, p99 ≈ 1 min**. If you know the domain/email ahead of time, [prefetch](https://docs.context.dev/optimization/prefetching) it (free) so the later retrieve lands warm; otherwise set `timeoutMS` generously (up to `300000`). Brand prefetch warms `/brand/retrieve`; styleguide prefetch warms `/web/styleguide`. Neither affects other `/web/*` or `/brand/ai/*` calls. Details: [rate limits](https://docs.context.dev/optimization/rate-limits) · [best practices](https://docs.context.dev/optimization/best-practices).

## Errors

Errors carry an `error_code`; through the SDKs they surface as typed exceptions with the status code (the SDKs do **not** auto-retry). Common cases:

| Status | Meaning                                                               | Recovery                                                               |
| ------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 400    | Malformed input; `WEBSITE_ACCESS_ERROR` (live site blocked/unscrapable); `WEBSITE_NOT_FOUND` (domain doesn't resolve); `NOT_FOUND` (no brand matched — not billed); `PDF_SKIPPED` (target is a PDF and `pdf[shouldParse]=false`); or `PDF_IMAGES_ONLY` (scanned PDF — retry with OCR enabled) | Validate input; treat `WEBSITE_ACCESS_ERROR`/`WEBSITE_NOT_FOUND`/`NOT_FOUND` as "no brand / not found"; retry `PDF_IMAGES_ONLY` with `ocr=true` |
| 401    | Missing/invalid key                                                   | Check `CONTEXT_DEV_API_KEY`                                            |
| 403    | `FORBIDDEN` (e.g. prefetch or people enrich without a paid plan) / `USAGE_EXCEEDED` | Check plan / quota                                                     |
| 408    | Cold-hit or `timeoutMS` exceeded                                      | Prefetch, raise `timeoutMS`, or retry                                  |
| 413    | `CONTENT_TOO_LARGE` — requested content exceeds the 20 MB download cap | Permanent for that URL; don't retry                                    |
| 422    | Free/disposable email on the `*-by-email` endpoints and `/people/enrich`; or `COLD_DOMAIN_TIMEOUT_TOO_LOW` (`timeoutMS` under 10s on an uncached domain) | Skip enrichment for personal emails; raise `timeoutMS` ≥ 10s or prefetch first |
| 429    | Rate limit                                                            | Exponential backoff                                                    |

Full catalog: [Troubleshooting](https://docs.context.dev/optimization/troubleshooting).

## Gotchas

- **Fields are nullable.** Logos, colors, stock, phone, links may be absent, so always fall back.
- **Pick the right logo.** Filter by `mode` (`light`/`dark`/`has_opaque_background`) and `type` (`logo` horizontal / `icon` square); don't assume `logos[0]`.
- **Color `name` is generated**, not the brand's official name; key off `hex`.
- **Bare domains only** (`stripe.com`), and **XOR `domain`/`directUrl`** on styleguide, fonts, screenshot, and `/brand/ai/products`.
- **Brand data caches ~3 months** server-side; pass `maxAgeMs: 0` to force a refresh where supported.
- **Logo Link is separate.** For high-volume logo embedding in a UI, use `https://logos.context.dev/?publicClientId=...&domain=...`: a front-end-safe `publicClientId`, no API key, its own quota. See [Get logos from a domain](https://docs.context.dev/guides/get-logo-from-url).

## Reference

- Machine index for agents: [docs.context.dev/llms.txt](https://docs.context.dev/llms.txt)
- [Introduction](https://docs.context.dev/introduction) · [Brand data](https://docs.context.dev/guides/get-brand-data) · [Scraping](https://docs.context.dev/guides/scrape-websites-to-markdown) · [Design system](https://docs.context.dev/guides/extract-design-system-from-website) · [Products](https://docs.context.dev/guides/extract-product-from-websites) · [Structured extraction](https://docs.context.dev/guides/extract-structured-data-from-websites) · [Transactions](https://docs.context.dev/guides/enrich-transaction-codes) · [Classification](https://docs.context.dev/guides/classification/overview)
- Optimization: [prefetching](https://docs.context.dev/optimization/prefetching) · [rate limits](https://docs.context.dev/optimization/rate-limits) · [best practices](https://docs.context.dev/optimization/best-practices) · [troubleshooting](https://docs.context.dev/optimization/troubleshooting) · [fair use](https://docs.context.dev/optimization/fair-use)
