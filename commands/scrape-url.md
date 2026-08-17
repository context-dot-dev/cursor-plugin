---
name: scrape-url
description: Scrape a URL to markdown via Context.dev MCP for live page content the agent can read.
---

# Scrape a URL to markdown

1. Obtain the full **URL** from the user (must include scheme, e.g. `https://example.com/docs`).
2. Confirm the `context` MCP server is enabled and authenticated. If authentication is required, use the `connect-context-dev` skill.
3. Call `web-scrape-markdown` with the URL.
4. Return the relevant Markdown or answer the user's question from it. Preserve source links when useful.
5. Do not fabricate page content. If the scrape fails, report the actual error and suggest a narrower selector, a longer timeout, or a retry only when appropriate.
