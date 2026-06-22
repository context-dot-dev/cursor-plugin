# Context.dev Cursor Plugin

Official Cursor plugin for [Context.dev](https://context.dev): brand intelligence, web scraping, structured extraction, and industry classification for AI agents.

## What it includes

| Component | Purpose |
| --- | --- |
| **MCP server** | Connects to Context.dev's hosted MCP at `https://context-dev.stlmcp.com` |
| **Skills** | API reference skill + onboarding skill for API key setup |
| **Commands** | `/brand-colors`, `/scrape-url` for common workflows |
| **Rules** | Routes live-data questions to MCP and enforces secure API integration patterns |

The MCP server uses Code Mode: the agent gets `search_docs` and `execute` tools and runs TypeScript against the Context.dev SDK in a sandbox.

## Prerequisites

- [Cursor](https://cursor.com) with MCP support
- A Context.dev API key ([sign up free](https://context.dev/signup); keys start with `ctxt_secret_`)

## Setup

1. Install this plugin from the Cursor marketplace (or open this repo locally for development).
2. Open **Cursor Settings → Tools & MCP**.
3. Find the `context_dev_api` server and set your API key:
   - Header `x-context-dev-api-key`: your `ctxt_secret_...` key, **or**
   - Environment variable `CONTEXT_DEV_API_KEY` if your Cursor setup resolves `${CONTEXT_DEV_API_KEY}` from the shell
4. Enable the MCP server and restart Cursor if needed.

Example manual MCP config (for reference):

```json
{
  "mcpServers": {
    "context_dev_api": {
      "transport": "http",
      "url": "https://context-dev.stlmcp.com",
      "headers": {
        "x-context-dev-api-key": "ctxt_secret_..."
      }
    }
  }
}
```

Never commit your API key to source control.

## Verify it works

Ask the agent:

> What are the brand colors for stripe.com?

The agent should call the Context.dev MCP `execute` tool and return Stripe's actual brand colors (for example `#543cfb`), not a guess from training data.

For skill verification, ask:

> Using Context.dev, what's the fastest, lightest-payload way to get just a brand's logos and colors for a domain?

A loaded skill should answer with `GET /brand/retrieve-simplified`.

## Bundled components

### MCP (`mcp.json`)

Hosted HTTP connection to `context-dev.stlmcp.com`. Uses `${CONTEXT_DEV_API_KEY}` as the header placeholder.

### Skills

- `skills/context-dev/SKILL.md` — API endpoint reference, vendored from [docs.context.dev/skill.md](https://docs.context.dev/skill.md). Refresh with `node scripts/sync-skill.mjs`.
- `skills/get-api-key/SKILL.md` — onboarding flow when the user needs to sign up or configure their API key.

### Commands

| Command | What it does |
| --- | --- |
| `/brand-colors` | Look up a domain's brand colors via live MCP data |
| `/scrape-url` | Scrape a URL to markdown |

### Rules

- `prefer-context-dev-mcp.mdc` — use MCP for live brand and web data
- `context-dev-api-security.mdc` — never expose API keys client-side; use Logo Link for UI logos

## Development

Validate the plugin structure:

```bash
node scripts/validate-plugin.mjs
```

Sync the skill from upstream docs:

```bash
node scripts/sync-skill.mjs
```

## Advanced: local MCP server

If you prefer a local stdio server instead of the hosted endpoint, see [Install MCP](https://docs.context.dev/install-mcp) for `npx context.dev-mcp@latest`.

## Links

- [Context.dev docs](https://docs.context.dev)
- [MCP install guide](https://docs.context.dev/install-mcp)
- [API reference index](https://docs.context.dev/llms.txt)
- [Agent quickstart](https://docs.context.dev/agent-quickstart)

## License

MIT — see [LICENSE](LICENSE).
