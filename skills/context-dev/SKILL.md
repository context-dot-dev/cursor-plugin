---
name: context-dev
description: Build application code directly against the Context.dev REST API or SDKs with server-side API-key authentication. Use when the user asks to integrate Context.dev into a codebase, choose an SDK method or REST endpoint, debug an API request, or implement a backend Context.dev workflow. For ordinary live-web work inside Cursor, use the focused Context.dev MCP skills instead.
license: MIT
metadata:
  author: context.dev
  version: "5.2"
  last_verified: "2026-09-26"
---

# Context.dev integration guide

Context.dev provides web scraping, URL mapping, crawling, web search and research, document parsing, and brand, people, and news data through `https://api.context.dev/v1`. One Scrape request can return any mix of nine outputs: Markdown, rendered HTML, a screenshot, images, original bytes, CSS-selected fields, highlights, JSON, and product data. Use the public OpenAPI document at [docs.context.dev/openapi.json](https://docs.context.dev/openapi.json) as the authority for paths, methods, parameters, and response fields.

## Get access

- To call Context.dev from this agent session without writing code, connect the MCP server `https://mcp.context.dev/mcp`. It signs in with OAuth in the user's browser and does not use an API key. Setup for each client: https://docs.context.dev/install-mcp.md
- Application code and the CLI read an API key from `CONTEXT_DEV_API_KEY`. If none is configured, follow https://www.context.dev/auth.md: register with the user's email, deliver the returned setup link and code to the user before polling, and store the key in an ignored environment file or secret manager without displaying it. Never ask the user to paste a key into chat.
- Complete setup instructions: https://docs.context.dev/agent-quickstart.md

## Keep credentials server-side

Read the bearer token from `CONTEXT_DEV_API_KEY`. Never print it, commit it, include it in browser code, or forward it to a target website.

```bash
export CONTEXT_DEV_API_KEY="ctxt_secret_..."

curl https://api.context.dev/v1/web/scrape \
  -H "Authorization: Bearer $CONTEXT_DEV_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": { "markdown": true },
    "sharedParams": { "mainContentOnly": true }
  }'
```

## Route from input to operation

Choose the narrowest operation that directly returns the needed result.

| Input and desired result | Operation | Task guide |
| --- | --- | --- |
| One URL to Markdown or rendered HTML | `POST /web/scrape` with `formats.markdown` or `formats.html` | [Scrape](https://docs.context.dev/scrape/overview) |
| Known CSS selectors on one page to JSON | `POST /web/scrape` with `formats.parse` and `parseParams.rules` | [Parse fields](https://docs.context.dev/scrape/parse-fields) |
| One URL and a question to the most relevant passages | `POST /web/scrape` with `formats.highlights` and `highlightsParams.query` | [Highlights](https://docs.context.dev/scrape/highlights) |
| One URL and a JSON Schema to a structured object | `POST /web/scrape` with `formats.json` and `jsonParams.schema` | [JSON](https://docs.context.dev/scrape/json) |
| Exact URL to an inline PNG, JPEG, or WebP screenshot | `POST /web/scrape` with `formats.screenshot` | [Screenshot](https://docs.context.dev/scrape/screenshot) |
| URL to image assets | `POST /web/scrape` with `formats.images` | [Images](https://docs.context.dev/scrape/images) |
| Resource URL to complete base64 bytes | `POST /web/scrape` with `formats.bytes` | [Bytes](https://docs.context.dev/scrape/bytes) |
| Product page to a product record with price, availability, images, and variants | `POST /web/scrape` with `formats.product` | [Product](https://docs.context.dev/scrape/product) |
| YouTube video URL to metadata and a timestamped transcript | `POST /web/scrape` with `formats.markdown` | [YouTube](https://docs.context.dev/scrape/youtube) |
| Page that needs clicks, scrolls, or waits before capture | `POST /web/scrape` with `sharedParams.actions` | [Browser actions](https://docs.context.dev/scrape/browser-actions) |
| Domain to its indexed URLs with page titles and descriptions | `GET /web/urls` | [Map URLs](https://docs.context.dev/map/overview) |
| Starting URL to linked pages in one response, up to 500 pages | `POST /web/crawl` | [Crawl](https://docs.context.dev/crawl/overview) |
| Starting URL or sitemap to a background crawl, up to 25,000 pages | `POST /batch/submit` with `input.mode: "crawl"` | [Async crawls](https://docs.context.dev/crawl/async) |
| URL list to Markdown or HTML in the background, up to 25,000 URLs | `POST /batch/submit` | [Batches](https://docs.context.dev/batches/overview) |
| Search query to ranked web results, optionally with Markdown | `POST /web/search` | [Search](https://docs.context.dev/search/overview) |
| Research task to structured JSON and source URLs | `POST /web/answers` | [Answers](https://docs.context.dev/answers/overview) |
| Uploaded document up to 50 MiB to Markdown | `POST /parse` | [Parse](https://docs.context.dev/parse/overview) |
| Domain, name, work email, ticker, direct URL, or transaction descriptor to company profile | `POST /brand/retrieve` | [Brand](https://docs.context.dev/brand/overview) |
| Partial name or domain to matching indexed brands | `GET /brand/search` | [Brand search](https://docs.context.dev/brand/search) |
| Domain or exact URL to design styles, font families, and available font files | `GET /web/styleguide`; read `styleguide.typography` and `styleguide.fontLinks` for fonts | [Styleguide](https://docs.context.dev/brand/styleguide) |
| Domain or work email known before a Brand or Styleguide request | `POST /utility/prefetch` | [Prefetch](https://docs.context.dev/brand/prefetching) |
| Person email, profile URL, or name plus company, school, or location to a person profile | `POST /people/enrich` (beta, paid plans) | [People](https://docs.context.dev/people/overview) |
| Company name, domain, ticker, or ISIN to news articles | `POST /news/search` | [News](https://docs.context.dev/news/overview) |
| URL or site to recurring change detection | `/monitors` operations | [Monitors](https://docs.context.dev/monitors/overview) |
| Context.dev bug, docs mismatch, or friction you hit while integrating | `POST /feedback` | [Agent feedback](https://docs.context.dev/optimization/agent-feedback) |

Do not use a general scrape when a purpose-built Brand or monitor operation already returns the required shape.

## Verify the installed SDK before using it

| Language | Package | Client setup | Scrape and Map URLs |
| --- | --- | --- | --- |
| TypeScript | `context.dev` | `new ContextDev({ apiKey: process.env.CONTEXT_DEV_API_KEY })` | `client.web.scrape`, `client.web.mapUrls` |
| Python | `context.dev` | `ContextDev(api_key=os.environ["CONTEXT_DEV_API_KEY"])` | `client.web.scrape`, `client.web.map_urls` |
| Ruby | `context.dev` | `ContextDev::Client.new(api_key: ENV.fetch("CONTEXT_DEV_API_KEY"))` | `client.web.scrape`, `client.web.map_urls` |
| Go | `github.com/context-dot-dev/context-go-sdk/v2` | Use the `/v2` module; inspect its generated request model. | `client.Web.Scrape`, `client.Web.MapURLs` |
| PHP | `context-dev/context-dev-php` | Inspect the installed package version and generated method signature. | `$client->web->scrape`, `$client->web->mapUrls` |

- Go needs the `/v2` module path for `Web.Scrape`, `Web.MapURLs`, and the current Brand request body.
- The PHP Brand helper can't express a single lookup type; use the SDK's low-level request method for Brand calls.
- Published packages can lag the API. If an installed scrape method doesn't accept `highlightsParams`, `jsonParams`, or `productParams`, send the request with the SDK's low-level request method. Do not invent generated types or pass fields the installed signature does not accept.
- SDKs time out after 60 seconds per attempt (Go has no default timeout) and retry twice on connection errors, `408`, `409`, `429`, and `5xx`. Raise the SDK timeout above `timeoutOpts.milliseconds` for long requests.

For installation, runnable examples, and low-level request methods, read [SDKs](https://docs.context.dev/sdks). For a first request and a trimmed response, read the [Quickstart](https://docs.context.dev/quickstart).

## Scrape controls

- `formats`: enable at least one of `html`, `markdown`, `screenshot`, `images`, `bytes`, `parse`, `highlights`, `json`, or `product`. Outputs share one page visit. Each output has `requested`, `success`, and `data`; `success` is `true` when retrieved, `false` when retrieval fails, and `null` when not requested. Failed outputs have `data: null` and do not discard successful outputs. Cost depends on the formats; see the cost table below.
- `maxAgeMs`: chooses acceptable cache age. Scrape and both scrape/crawl batches default to three days (`259200000` ms) and accept up to 365 days (`31536000000` ms). Synchronous Crawl defaults to one day and accepts up to 30 days. Set `0` to fetch fresh and refresh the requested outputs. Each Scrape output has its own cache key, so one response can combine cached outputs from different visits. Brand and Styleguide default to three months, accept `0` for a hard refresh, and clamp values above one year. The direct-URL and transaction Brand variants do not accept this control. Custom headers, actions, and `zdr` bypass cache reads and writes; otherwise inspect `cache_metadata.status` (`hit`, `miss`, or `zdr`) and `age_ms`.
- `timeoutOpts`: set `milliseconds` up to 300,000 and choose `behavior: "fail"` or `"return-partial"` where supported. Reaching the overall deadline with `"fail"` returns `408`. Scrape requires at least 5,000 ms for `return-partial` and marks partial captures or failed outputs with `isPartial: true`; individual outputs can fail under either behavior while others succeed. Crawl and Map URLs return `partial: true`. Prefetch is fail-only and Parse does not accept `timeoutOpts`. See [timeouts](https://docs.context.dev/optimization/timeouts).
- `maxPages`, `maxDepth`, `urlRegex`, and `stopAfterMs`: bound crawl coverage, time, and credit exposure. Crawl caps `maxPages` at 500.
- `sharedParams.mainContentOnly`, `includeSelectors`, `excludeSelectors`, and `includeFrames`: control page content before conversion. Exclusions win. Filters apply to HTML, Markdown, images, and parsed fields, never to `bytes`.
- `formats.parse` with `parseParams.rules`: map each field name to a CSS selector string or `{selector, type: "item" | "list", output: "text" | "html" | "@attribute" | nested rules}`. Results arrive in `parsed.data`; missing items return `null` and missing lists return `[]`. Runs without an LLM.
- `sharedParams.waitFor` (milliseconds or a CSS selector; default 500 ms), `settleAnimations`, and browser actions (`type: "perform" | "scroll" | "wait" | "waitFor"`, 1 to 5 per request): handle dynamic page state. Actions require a paid plan and bypass the cache. Action or selector failures can leave affected outputs with `success: false`; verify the page state from successful captured outputs.
- `formats.bytes`: returns the original HTTP body as `{contentType, base64}` after decompression, up to 20 MiB decoded. Waiting, actions, and content filters never change it; request `formats.html` for rendered HTML.
- `sharedParams.headers` go to the target origin only and are separate from the API bearer key. `sharedParams.country` is a two-letter code for the network exit of the page fetch and image downloads; an unsupported code returns `400` before the scrape starts. See [location and headers](https://docs.context.dev/scrape/location-and-headers).
- `screenshot.data` is an inline data URL (`data:image/png;base64,...`) when `screenshot.success` is `true`; otherwise it is `null`. Choose the capture area with `screenshotParams.area` (`viewport`, `fullPage`, `{selector}`, or a rectangle) up to 40 megapixels.
- `zdr: "enabled"`: bypasses shared caches and retained content logs only when Zero Data Retention is enabled for the organization; otherwise the request fails with `403`.

Browser rendering and proxy routing improve access but do not guarantee that a page can be read. Preserve a fallback for `WEBSITE_BLOCKED`, login walls, missing content, and partial crawl results.

## Map a website's URLs

`GET /web/urls` lists a site's URLs from Context.dev's index and adds stored `title`, `description`, `keywords`, and `language` where available. Pass `domain` without a protocol; narrow with `urlRegex`, `maxLinks` (default 10,000), `includeSubdomains`, or `search` (relevance-ordered). The SDK methods are `client.web.mapUrls` (TypeScript) and `client.web.map_urls` (Python, Ruby).

URLs without stored metadata return with only `url` and are queued for background enrichment, so a later request can include their metadata. Requests with `zdr=enabled` or credential-bearing target headers return URLs only and do not queue enrichment. `partial: true` means the deadline stopped URL mapping. Feed the result into Scrape, Crawl, or a batch.

## Retrieve brand data

Send exactly one lookup variant:

| `type` | Required field | Important constraint |
| --- | --- | --- |
| `by_domain` | `domain` | Prefer a bare company domain. |
| `by_name` | `name` | 3 to 30 characters; use `country_gl` as an ambiguity hint. |
| `by_email` | `email` | Free and disposable providers return `422`. |
| `by_ticker` | `ticker` | Add `ticker_exchange` when known. |
| `by_direct_url` | `direct_url` | Reads only that page; no wider resolver or cross-source enrichment. |
| `by_transaction` | `transaction_info` | Add MCC, city, country, or phone hints when available. |

```typescript
const response = await client.brand.retrieve({ type: "by_domain", domain: "stripe.com" });
const title = response.brand?.title ?? "Unknown company";
```

An uncached domain or email lookup with `behavior: "fail"` and `timeoutOpts.milliseconds` under 10,000 returns `422 COLD_DOMAIN_TIMEOUT_TOO_LOW`; allow 60,000 ms or prefetch. Brand arrays and nested fields can be missing or empty. Select logos by `type`, `mode`, and resolution; do not assume `logos[0]` is appropriate. Treat address, contacts, employee count, classifications, and stock data as discovered data rather than verified legal records.

## Permissions and other operation notes

- Restricted API keys need the relevant [scope](https://docs.context.dev/account/api-keys): `data:execute` for direct data calls, Read/Manage scopes for monitors and batches, and `logs:read` for request logs. Any key can submit Agent Feedback. Dashboard [team roles](https://docs.context.dev/account/team) are independent; Members can use shared credentials and incur charges.
- Answers defaults to `ultra` mode; `fast` is cheaper and quicker. `json_format` is an example object, and source URLs are not per-field citations.
- Scrape, Map URLs, Crawl, Search, Answers, Parse, People Enrich, and Styleguide honor `zdr` when the organization is entitled.
- Page monitors accept `include_selectors`/`exclude_selectors`; changing them establishes a new baseline.

## Budget requests

| Operation | Credits |
| --- | --- |
| `POST /web/scrape` | 1, or 2 with `sharedParams.actions`. Highlights +3 when passages are returned; JSON +4 on success; product +1 on success or a missing page; product AI fallback +6 when used; PDF OCR +1 per recovered page on a fresh fetch. 0 when every output fails, except a target 404, which charges the base (+1 with product). |
| `GET /web/urls` | 1, or 2 with `search` |
| `POST /web/crawl` | 1 per page; rate-limit weight 10 |
| `POST /web/search` | 1 per 10 results, with or without page content |
| `POST /web/answers` | 10 (`fast`) or 100 (`ultra`, the default), charged only on success |
| `POST /parse` | 1, plus 1 per OCR-recovered page |
| `POST /brand/retrieve`, `GET /web/styleguide` | 10 |
| `GET /brand/search` | 1; free on Pro, Growth, and Scale |
| `POST /people/enrich` | 20 per match; paid plans |
| `POST /news/search` | 1 per 10 results |
| `POST /utility/prefetch` | 0; paid plans |
| `POST /batch/submit` | 1 per page: 1 reserved per accepted URL (a crawl reserves `maxUrls`), refunded for pages that don't succeed, plus 1 per OCR-recovered PDF page |
| `POST /monitors`, `POST /monitors/{id}/run` | Per run: 1 for a page or sitemap monitor, 10 for an extract monitor. Baseline runs, at creation or after a re-baseline, are charged; failed and skipped runs are free. |
| Other batch and monitor operations, webhook deliveries, request logs, `POST /feedback` | 0 |

Processed `404` results on priced data APIs and successful partial results are charged. Validation, authentication, rate-limit, timeout, and server errors are not. Record `key_metadata.credits_consumed` or the `X-Credits-Used` header instead of inferring cost from status. Plan allowances are on [Credits and pricing](https://docs.context.dev/account/credits).

## Handle errors by category

Inspect both the HTTP status and `error_code` for request errors. Scrape also reports output failures inside `200` responses: inspect each output's `success` and preserve `isPartial: true`. Use raw HTTPS or the SDK's raw response if an older generated model does not expose these fields.

| Status | Treat as | Action |
| --- | --- | --- |
| `400` | Invalid request, inaccessible or blocked target on operations that fetch one directly (`WEBSITE_ACCESS_ERROR`, `WEBSITE_BLOCKED`), image-only PDF on Parse (`PDF_IMAGES_ONLY`), skipped PDF (`PDF_SKIPPED`), or no match, depending on `error_code` | Fix the input or options. For `PDF_IMAGES_ONLY`, retry Parse with `ocr=true`. Use a fallback for a no-match or inaccessible site. |
| `401` | Missing or unknown key (`NOT_FOUND`), disabled key (`DISABLED`), or not enough credits (`USAGE_EXCEEDED`) | Fix the key or account state; do not retry unchanged. |
| `403` | Missing key scope (`INSUFFICIENT_PERMISSIONS`, with `required_permission`), paid-plan feature (`PAID_PLAN_REQUIRED`), too many active batches (`BATCH_LIMIT_EXCEEDED`), or ZDR not enabled (`ZDR_NOT_ENABLED`) | Do not retry unchanged; inspect `error_code`. |
| `404` | Target or entity not found on operations that define it | Treat as an expected empty outcome where appropriate. |
| `408` | The request reached `timeoutOpts.milliseconds` with `behavior: "fail"` (`REQUEST_TIMEOUT`) | Retry outside a user-facing path, raise the budget, use `return-partial` where supported, or prefetch supported Brand and Styleguide requests. |
| `200` with a failed Scrape output | Retrieval, parsing, actions, selectors, or output limits prevented that output from completing | Preserve successful outputs and fix the target or options before retrying the failed output. Oversized outputs have `success: false` and `data: null`. |
| `413`, `415` | Content too large (such as a Parse upload over 50 MiB) or unsupported, on operations that define these errors | Use a smaller or supported input. Scrape marks such outputs as failed instead. |
| `422` | An operation-specific input restriction, such as a free email domain or a Brand timeout that is too low | Change the input or options; do not retry unchanged. |
| `429` | Rate limit for this API key | Honor `Retry-After`; retry with jittered, bounded backoff. |
| `500`, `502`, `503` | Transient failure: a service error, an incomplete browser capture, or no browser capacity | Retry with jittered, bounded backoff, then surface a fallback. |

Do not retry validation, permission, no-match, content-size, or unsupported-media failures unchanged. The SDKs already retry twice; account for that before adding another retry layer. See [Troubleshooting](https://docs.context.dev/optimization/troubleshooting) and [Rate limits](https://docs.context.dev/optimization/rate-limits) for operation-specific behavior.

## Report problems with Agent Feedback

When an endpoint, docs page, SDK, or CLI behaves differently than documented, offer to report it with [Agent Feedback](https://docs.context.dev/optimization/agent-feedback): `POST https://api.context.dev/v1/feedback` with the same bearer key. It works with any API key and has its own rate limit. Send one report per problem with the affected `request_id` so the team can see the exact request, and keep secrets and personal data out of the note.

```json
{
  "request_id": "<request_id from the affected response>",
  "category": "docs_mismatch",
  "note": "The response is missing a documented field; expected it per the API reference."
}
```

Send `url` instead of, or with, `request_id` for a docs page or one page of a crawl. Categories are `bug`, `docs_mismatch`, `friction`, `feature_gap`, `quality_degradation`, and `other`. Reporting the same `request_id` again returns the original `feedback_id` with `already_submitted: true`. In an MCP session, use the `submit-feedback` tool instead.

## Completion checklist

Before declaring an integration complete:

- Confirm the path, method, and parameter names against the current API reference.
- Request only the `formats` the task needs, and read each output's `data` rather than assuming it is present.
- Keep the API key on the server and prove the missing-key path is intentional.
- Bound crawl size, latency, retries, and credit exposure.
- Handle missing fields and expected no-result states.
- Validate parsed and structured output and preserve provenance when needed.
- Run a focused success test and at least one relevant failure test.

For long-lived integrations, read [Security and API stability](https://docs.context.dev/optimization/trust) and the [changelog](https://docs.context.dev/changelog).
