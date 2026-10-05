---
name: connect-context-dev
description: Connect or troubleshoot Context.dev in Cursor using the production MCP server and OAuth. Use when the user installs this plugin, asks how to authenticate, cannot see Context.dev tools, or receives a 401 from the Context MCP.
---

# Connect Context.dev in Cursor

## Standard connection

1. Open **Cursor Settings → Tools & MCP**.
2. Find the `context` server installed by this plugin and enable it.
3. Select **Connect** or **Authenticate**.
4. Complete the Context.dev sign-in and consent flow in the browser.
5. Return to Cursor and confirm that the server lists its tools.

The plugin uses the production Streamable HTTP endpoint at `https://mcp.context.dev/mcp`. OAuth is discovered from the server automatically. Do not add headers, client secrets, or API keys to `mcp.json`.

## Verify

Use a read-only request:

```text
Use Context.dev to scrape https://www.context.dev and return the page title.
```

The agent should call `web-scrape` with `formats: { markdown: true }`. A successful tool call confirms both the MCP connection and the authenticated Context account.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `context` is missing | Refresh or reinstall the plugin, then reload the Cursor window |
| A second legacy Context.dev server appears | Remove the old manual server and reinstall this plugin |
| 401 or authentication required | Disconnect the server, reconnect it, and complete OAuth again |
| Browser flow does not open | Open the server details and select Authenticate manually |
| Tools remain unavailable after OAuth | Reload the Cursor window and re-enable the server |
| Account has insufficient credits | Use `get-usage` to check the balance and next refill; use `get-usage-history` for recent consumption; do not repeatedly retry |

Never ask the user to paste an OAuth token or private API key into chat.

## Direct API development

OAuth covers Cursor's MCP connection. A user only needs an API key when writing their own application against the Context.dev REST API or SDK. In that case, direct them to the Context.dev dashboard and store the key in a server-side `CONTEXT_DEV_API_KEY` environment variable. Do not place it in this plugin's MCP configuration.
