# Context.dev for Cursor

The official [Context.dev](https://context.dev) plugin for Cursor. Give Cursor reliable access to the live web: search, company news, scraping, crawling, structured extraction, document parsing, brand intelligence, screenshots, recurring monitors, account usage, and large asynchronous batches.

## Install and connect

1. Install **Context.dev** from the Cursor Marketplace.
2. Open **Cursor Settings → Tools & MCP** and enable the `context` server.
3. Select **Connect** or **Authenticate**, then sign in to Context.dev and approve access.

The plugin connects to `https://mcp.context.dev/mcp` with OAuth. You do not need to copy an API key into Cursor.

If an older installation still shows a legacy Context.dev server, remove that manual server and reinstall or refresh the plugin.

## Try it

Ask Cursor:

```text
Use Context.dev to search for Stripe's latest official product announcements and cite the source URLs.
```

```text
Use Context.dev to scrape https://www.context.dev/pricing and summarize the plans.
```

```text
Use Context.dev to retrieve the brand profile for linear.app, including its logo, colors, fonts, and social profiles.
```

Cursor automatically selects the appropriate Context.dev tool. Tool calls require normal Cursor approval, and account-changing tools such as monitor, batch, cancel, update, and delete operations should only run when explicitly requested.

## Included

| Component | What it provides |
| --- | --- |
| MCP server | The production Context.dev MCP with 42 direct, typed tools and OAuth |
| Skills | Focused MCP workflows, direct API guidance, Cursor connection help, and Logo Link integration |
| Commands | `/brand-colors`, `/scrape-url`, `/search-web`, and `/extract-web-data` |
| Rules | Routes live-web tasks to the right Context.dev tool and keeps credentials out of client code |

### Skill catalog

| Skill | When Cursor uses it |
| --- | --- |
| `context-search` | Live web research and source discovery |
| `context-scrape` | Markdown, HTML, images, screenshots, or structured JSON from one known URL |
| `context-crawl` | URL discovery and focused multi-page crawling |
| `context-extract` | Schema-shaped JSON from a known webpage |
| `context-parse` | PDFs, Office files, images, and other local document bytes |
| `context-brand` | Brand profiles, design systems, fonts, and industry codes |
| `context-monitor` | Recurring website-change detection and history |
| `context-batches` | Large asynchronous scrape and crawl jobs |
| `context-dev` | Building directly with the Context.dev REST API or SDKs |
| `connect-context-dev` | OAuth setup and MCP troubleshooting |
| `logolink` | Safe dynamic company logos in frontend applications |

### MCP tool catalog

| Group | Tools |
| --- | --- |
| Parse | `parse-document` |
| Web | `web-scrape`, `web-map`, `web-crawl`, `web-search`, `web-answers` |
| Company and people | `get-news-search`, `get-brand`, `brand-retrieve-unified`, `brand-search`, `people-enrich`, `web-styleguide` |
| Batches | `submit-batch`, `list-batches`, `get-batch`, `get-batch-results`, `cancel-batch`, `delete-batch` |
| Monitors | `create-monitor`, `list-monitors`, `get-monitor`, `update-monitor`, `delete-monitor`, `get-monitor-limits`, `list-monitor-credit-usage`, `run-monitor-now`, `list-monitor-runs`, `get-monitor-run`, `list-account-runs`, `list-monitor-changes`, `get-change`, `list-changes`, `rotate-monitor-webhook-secret` |
| Webhooks | `list-webhook-deliveries`, `get-webhook-delivery`, `list-webhook-delivery-attempts`, `retry-webhook-delivery` |
| Account and feedback | `get-usage`, `get-usage-history`, `list-logs`, `get-log`, `submit-feedback` |

For a known page, use `web-scrape` with `formats: { markdown: true }`. Use `web-search` when the URL is unknown, `web-crawl` for a focused multi-page request, and `submit-batch` for up to 25,000 URLs or a large asynchronous crawl.

## Building with the Context.dev API

OAuth connects Cursor to the MCP server. If you are writing application code that calls the Context.dev REST API or SDK directly, create an API key in the [Context.dev dashboard](https://context.dev) and keep it in a server-side `CONTEXT_DEV_API_KEY` environment variable. Never put a private API key in browser code or commit it to source control.

The bundled `context-dev` API reference is synchronized from [docs.context.dev/skill.md](https://docs.context.dev/skill.md). Its Cursor activation description is narrowed to direct API and SDK development, while the focused OAuth skills route interactive work through the public production MCP tools.

## Local development

Validate the repository and confirm that the bundled API skill matches the published documentation:

```bash
node scripts/validate-plugin.mjs
node scripts/sync-skill.mjs --check
node scripts/check-mcp-oauth.mjs
```

Load the plugin from this checkout using Cursor's documented local-plugin directory:

```bash
mkdir -p ~/.cursor/plugins/local
rsync -a --delete --exclude '.git/' ./ ~/.cursor/plugins/local/context-dev/
```

Then run **Developer: Reload Window** in Cursor and verify that the `context` MCP server, four commands, eleven skills, and two rules appear. A copied directory is used because current Cursor builds reject local-plugin symlinks whose targets are outside `~/.cursor/plugins/local`.

## Links

- [Context.dev documentation](https://docs.context.dev)
- [Context.dev API reference](https://docs.context.dev/llms.txt)
- [Cursor plugin documentation](https://cursor.com/docs/plugins)
- [Support](mailto:support@context.dev)

## License

MIT — see [LICENSE](LICENSE).
