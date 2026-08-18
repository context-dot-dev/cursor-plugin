---
name: context-scrape
description: Scrape or capture one known webpage with Context.dev. Use when the user supplies a URL and wants its readable content, raw HTML, images, a screenshot, page metadata, or content revealed through explicitly requested browser actions.
---

# Scrape one page

Choose the narrowest Context.dev MCP tool for the requested output:

| Need | Tool |
| --- | --- |
| Clean readable content for analysis or RAG | `web-scrape-markdown` |
| Raw DOM or HTML for code-level inspection | `web-scrape-html` |
| Images and their source metadata | `web-scrape-images` |
| Visual rendering of the page | `web-screenshot` |

## Workflow

1. Pass a complete `http://` or `https://` URL.
2. Default to Markdown unless the task specifically needs HTML, images, or pixels.
3. Request main content or selectors only when they improve the requested output.
4. Set cache age to zero only when the user explicitly needs a fresh fetch.
5. Return the requested content without adding facts that are absent from the page.

Browser actions can click or type on external sites. Run only actions required by the user's request, and never submit a form, purchase, message, or other state-changing action without explicit authorization.

Use `web-search` when the URL is unknown, `web-crawl` for several linked pages, and `submit-batch` for large asynchronous collections.
