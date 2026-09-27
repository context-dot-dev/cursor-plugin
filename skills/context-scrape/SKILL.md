---
name: context-scrape
description: Scrape or capture one known webpage with Context.dev. Use when the user supplies a URL and wants its readable content, raw HTML, images, a screenshot, page metadata, or content revealed through explicitly requested browser actions.
---

# Scrape one page

Use the Context.dev `web-scrape` MCP tool and request only the formats the user needs:

| Need | Format |
| --- | --- |
| Clean readable content for analysis or RAG | `formats: { markdown: true }` |
| Raw DOM or HTML for code-level inspection | `formats: { html: true }` |
| Images and their source metadata | `formats: { images: true }` |
| Visual rendering of the page | `formats: { screenshot: true }` |
| Schema-shaped JSON | `formats: { json: true }` with `jsonParams.schema` |

## Workflow

1. Pass a complete `http://` or `https://` URL.
2. Default to Markdown unless the task specifically needs HTML, images, or pixels.
3. Request main content or selectors only when they improve the requested output.
4. Set cache age to zero only when the user explicitly needs a fresh fetch.
5. Return the requested content without adding facts that are absent from the page.

Browser actions can click or type on external sites. Run only actions required by the user's request, and never submit a form, purchase, message, or other state-changing action without explicit authorization.

Use `web-search` when the URL is unknown, `web-crawl` for several linked pages, and `submit-batch` for large asynchronous collections.
