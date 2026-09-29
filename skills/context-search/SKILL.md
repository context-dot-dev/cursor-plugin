---
name: context-search
description: Search the live web or company news with Context.dev and return current, cited sources. Use when the user asks to search, research, look something up, find recent company announcements or articles, compare information across sites, or answer a current question without providing a known URL.
---

# Search the live web

Use the Context.dev `get-news-search` MCP tool for live or historical news about one company identified by name,
domain, ticker, or ISIN. Use `web-search` for broader source discovery or current information when the user does not
already have the exact page URL.

## Workflow

1. Choose `get-news-search` when the request is specifically about one company's coverage; otherwise use `web-search`.
2. Preserve named entities, dates, and constraints in the query or company identifier.
3. Set filters, freshness, or country only when the request calls for them.
4. Enable `highlightsOptions` when the answer needs relevant source passages, or `markdownOptions` when it needs complete page content.
5. Use the smallest result count that can answer the question.
6. Prefer authoritative or primary sources when the user asks for official information.
7. Summarize the relevant findings and cite the returned source URLs.

If the user provides a known URL, use `web-scrape` with `formats: { markdown: true }` instead. If a search result must be read in full, scrape only the selected result rather than every result.

Avoid repeating an identical search unless the first call failed or the query materially changed.
