---
name: context-extract
description: Extract schema-shaped JSON from websites with Context.dev. Use when the user wants structured records such as products, pricing plans, rankings, jobs, events, tables, listings, or explicitly requests JSON that follows a schema.
---

# Extract structured web data

Use the Context.dev `web-scrape` MCP tool with `formats: { json: true }` and `jsonParams.schema` when a known webpage must return a predictable JSON shape rather than free-form text.

## Workflow

1. Define the smallest JSON Schema that contains only the fields the user needs.
2. Give every field a clear description that distinguishes similar values.
3. Make fields optional or nullable when the source may omit them.
4. Pass the relevant URL and request only the JSON format.
5. Validate that the response follows the requested schema before presenting it.

Preserve source semantics. Tied ranks such as `=19`, ranges such as `101-150`, and unavailable scores are legitimate source values; do not silently convert or invent them.

Extraction does not remove site pagination. Discover additional pages with `web-map`, then use a batch when many page URLs must be processed. Use `web-scrape` with `formats: { markdown: true }` when the user only needs readable text.
