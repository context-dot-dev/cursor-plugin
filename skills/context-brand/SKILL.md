---
name: context-brand
description: Retrieve company brand intelligence and design data with Context.dev. Use when the user asks for a company's logo, colors, fonts, style guide, social profiles, description, industry, address, stock information, brand kit, or lookup by domain, name, email, ticker, ISIN, transaction descriptor, or direct URL.
---

# Retrieve brand intelligence

Choose the Context.dev MCP tool by output and identifier:

| Need | Tool |
| --- | --- |
| Visual brand profile for a domain | `get-brand` |
| Raw structured brand data or a non-domain lookup | `brand-retrieve-unified` |
| Lightweight company-name or domain search | `brand-search` |
| Website design system and component styling | `web-styleguide` |
| Person enrichment from identity clues | `people-enrich` |

## Workflow

1. Prefer a bare domain such as `stripe.com` when available.
2. Use `get-brand` when a visual card is useful; use `brand-retrieve-unified` when the result feeds code or a structured workflow.
3. Set `maxSpeed` as a boolean only when the user prioritizes speed over slower enrichment steps.
4. Select logo variants by type and light/dark mode rather than assuming the first logo is correct.
5. Preserve nullable fields and provide sensible presentation fallbacks without inventing data.

For dynamic frontend logo URLs, use the separate `logolink` skill. Do not expose a private Context API key in browser code.
