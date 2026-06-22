---
name: scrape-url
description: Scrape a URL to markdown via Context.dev MCP for live page content the agent can read.
---

# Scrape a URL to markdown

1. Obtain the full **URL** from the user (must include scheme, e.g. `https://example.com/docs`).
2. Confirm the `context_dev_api` MCP server is enabled. If calls return 401, load the `get-api-key` skill first.
3. Use MCP `execute` with `client.web.webScrapeMd({ url })` (1 credit).
4. Return the markdown content from the tool response. Summarize or quote relevant sections if the page is long.
5. Report `key_metadata.credits_consumed` and `credits_remaining` after the call.
6. Do not fabricate page content. If the scrape fails (`WEBSITE_ACCESS_ERROR`, timeout), report the error and suggest retrying with a higher `timeoutMS` if appropriate.
