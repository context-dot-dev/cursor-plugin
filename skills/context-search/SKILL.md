---
name: context-search
description: Search the live web with Context.dev and return current, cited sources. Use when the user asks to search, research, look something up, find recent announcements or articles, compare information across sites, or answer a current question without providing a known URL.
---

# Search the live web

Use the Context.dev `web-search` MCP tool when the user needs source discovery or current information and does not already have the exact page URL.

## Workflow

1. Turn the request into a concise search query that preserves named entities, dates, and constraints.
2. Set freshness or country only when the request calls for it.
3. Use the smallest result count that can answer the question.
4. Prefer authoritative or primary sources when the user asks for official information.
5. Summarize the relevant findings and cite the returned source URLs.

If the user provides a known URL, use `web-scrape-markdown` instead. If a search result must be read in full, scrape only the selected result rather than every result.

Avoid repeating an identical search unless the first call failed or the query materially changed.
