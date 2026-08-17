---
name: search-web
description: Search the live web with Context.dev and answer from current sources with URLs.
---

# Search the live web

1. Turn the user's request into a focused search query. Preserve explicit freshness, country, inclusion, and exclusion constraints.
2. Confirm the `context` MCP server is enabled and authenticated. If authentication is required, use the `connect-context-dev` skill.
3. Call `web-search`. Use domain filters when the user requests official or site-specific sources.
4. Answer from the returned results and cite the source URLs. Clearly separate sourced facts from any inference.
5. If the results are weak, refine the query once rather than inventing an answer.
