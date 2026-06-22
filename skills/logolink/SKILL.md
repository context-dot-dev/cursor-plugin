---
name: logolink
description: >-
  Use Context.dev Logo Link to dynamically pull in logos. Use when embedding
  company logos in UI (img tags, React components, CSS backgrounds, email HTML,
  spreadsheets), building logo walls, CRM avatars, or merchant icons — without
  calling the brand API from the frontend.
---

# Context.dev Logo Link

Logo Link delivers company logos via CDN. Pass a front-end-safe `publicClientId` and a `domain`; the URL returns raw image bytes (no JSON, no API key).

**Do not** use the brand API or MCP from browser/client code for logos. Use Logo Link instead.

## When to use

- User wants logos in a UI, landing page, CRM, directory, or transaction list
- User asks to "dynamically fetch/display company logos by domain"
- High-volume logo rendering where `ctxt_secret_` keys must stay server-side
- User needs a simple `<img src="...">` instead of parsing `brand.logos[]`

Use the **brand API** (see `context-dev` skill) when you need stored logos, multiple variants (light/dark/icon), or colors alongside the image.

## Step 1 — Get the Public Client ID

1. Sign up at [context.dev/signup](https://context.dev/signup) if needed (free tier: 10,000 Logo Link requests/month).
2. Copy the **Public Client ID** from [context.dev/dashboard/logolink](https://context.dev/dashboard/logolink). Keys look like `brandLL_xxx`.
3. Prefer an env var the codebase already uses, e.g. `NEXT_PUBLIC_LOGOLINK_KEY` or `VITE_LOGOLINK_PUBLIC_CLIENT_ID`. Never put `ctxt_secret_` keys in client code.

## Step 2 — Restrict referring domains

In the Logo Link dashboard, **Edit Restrictions** and allow only domains that embed the image (e.g. `*.example.com`, `localhost:3000`). The `publicClientId` is safe in frontend code only when restrictions are set.

## Step 3 — Build the URL

```text
https://logos.context.dev/?publicClientId=MY_PUBLIC_CLIENT_ID&domain=TARGET_DOMAIN
```

- Replace `MY_PUBLIC_CLIENT_ID` with the user's ID (or env var).
- Replace `TARGET_DOMAIN` with the company domain variable (bare domain, e.g. `stripe.com`).
- **GET** and **HEAD** only. Response is the image file; `Content-Type` is `image/png`, `image/svg+xml`, etc.
- **24-hour** `Cache-Control` on the response. Browser/CDN caching is expected.
- **Fallback:** if no logo is found, Logo Link returns a generated SVG monogram — `<img>` tags never 404.

## Step 4 — Implement in the codebase

1. Ask where logos should appear and which domain variable drives them.
2. Update **only** those locations; preserve existing fallback and `onError` patterns.
3. Examples:

```html
<img
  src="https://logos.context.dev/?publicClientId=brandLL_xxx&domain=stripe.com"
  alt="Stripe logo"
/>
```

```jsx
function CompanyLogo({ domain }) {
  const publicClientId = process.env.NEXT_PUBLIC_LOGOLINK_KEY;
  return (
    <img
      src={`https://logos.context.dev/?publicClientId=${publicClientId}&domain=${domain}`}
      alt={`${domain} logo`}
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );
}
```

## Usage rules

- **Allowed:** embed via URL in `<img>`, CSS `background-image`, email HTML, `=IMAGE()` in Sheets/Excel; normal browser caching.
- **Not allowed:** download and re-host logos in your own storage or persist image files outside cache headers. For that, use brand APIs server-side.

Logo Link requests are billed separately from API credits (no rate limit; one charge per unique logo per client per 24h).

## Links

- [Get logos from a domain](https://docs.context.dev/guides/get-logo-from-url)
- [Logo Link dashboard](https://context.dev/dashboard/logolink)
- [Pricing](https://context.dev/pricing)
