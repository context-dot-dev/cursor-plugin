---
name: brand-colors
description: Look up a domain's brand colors via Context.dev MCP and return hex values from live data.
---

# Brand colors for a domain

1. Obtain the **domain** from the user (bare domain only, e.g. `stripe.com` — no `https://`).
2. Confirm the `context` MCP server is enabled and authenticated. If authentication is required, use the `connect-context-dev` skill.
3. Call `get-brand` with the domain. This returns the visual brand card and structured brand data.
4. Return the color list with **hex** values from the tool response. Treat generated color names as hints rather than official brand names.
5. Do not guess colors from training data. If the brand cannot be resolved, say so clearly.
