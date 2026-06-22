---
name: brand-colors
description: Look up a domain's brand colors via Context.dev MCP and return hex values from live data.
---

# Brand colors for a domain

1. Obtain the **domain** from the user (bare domain only, e.g. `stripe.com` — no `https://`).
2. Confirm the `context_dev_api` MCP server is enabled. If calls return 401, load the `get-api-key` skill and walk through onboarding first.
3. Use MCP `execute` with `client.brand.retrieveSimplified({ domain })` — cheapest brand payload that includes colors.
4. Return the color list with **hex** values from the tool response. Use `color.name` only as a hint (names are generated, not official brand names).
5. Do not guess colors from training data. If the brand is not found (`NOT_FOUND`), say so clearly.
