---
name: extract-web-data
description: Extract structured JSON from a website with Context.dev using a clear, task-specific schema.
---

# Extract structured data from a website

1. Obtain the starting URL and the exact fields the user needs.
2. Build the smallest JSON Schema that represents those fields. Mark only genuinely required fields as required and describe ambiguous fields.
3. Confirm the `context` MCP server is enabled and authenticated. If authentication is required, use the `connect-context-dev` skill.
4. Call `web-extract` with the URL, schema, and concise instructions. Enable fact checking when every value must be stated on the source pages.
5. Return the structured result without silently filling missing fields. Explain unsupported or empty values plainly.
