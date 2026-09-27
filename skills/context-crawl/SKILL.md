---
name: context-crawl
description: Discover or read multiple pages from a website with Context.dev. Use when the user asks to map a site, find URLs in a sitemap, crawl documentation or a site section, gather several linked pages, or locate the most relevant pages within one domain.
---

# Map and crawl websites

Choose between URL discovery and content collection:

- Use `web-map` to discover and filter URLs without reading every page.
- Use `web-crawl` to retrieve content from a bounded set of linked pages.

## Workflow

1. Confirm the target domain or starting URL and the section the user cares about.
2. Use map search when the user wants particular pages rather than the whole site.
3. Apply path, subdomain, and link limits that match the request.
4. Keep synchronous crawls focused; do not expand scope beyond the requested site or section.
5. Return page URLs alongside the relevant content so results remain traceable.

Use `web-scrape` with `formats: { markdown: true }` for one known page. For a large crawl or thousands of URLs, use `submit-batch` instead of forcing the work through a synchronous crawl.
