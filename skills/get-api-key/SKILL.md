---
name: get-api-key
description: >-
  Onboard users to Context.dev: sign up, obtain a ctxt_secret_ API key, and
  configure the Cursor MCP server. Use when the user asks to sign up for
  Context.dev, connect the plugin, get an API key, set up Context.dev MCP, or
  when any Context.dev call returns 401/unauthenticated.
---

# Context.dev onboarding — get an API key

## When to use

- User has no `CONTEXT_DEV_API_KEY` configured (or MCP tools fail with missing credentials)
- User says: "sign me up for Context.dev", "connect Context.dev", "get me an API key", "set up the plugin"
- Context.dev API or MCP returns **401** / authentication errors

## Step 1 — Check for agent auth protocol (optional)

Before manual onboarding, fetch `https://context.dev/auth.md` (follow redirects).

- If the response is **valid markdown** (not an HTML error page), follow that live spec exactly for automated agent registration.
- If the URL returns **404** or HTML, skip to Step 2 (manual flow below).

## Step 2 — Sign up and copy the key

1. Direct the user to [context.dev/signup](https://context.dev/signup) (free tier, no credit card).
2. After signup, open the dashboard **API Keys** section and copy the key. Keys start with `ctxt_secret_`.
3. Existing users can sign in at [context.dev/login](https://context.dev/login) and copy a key from the dashboard.

Never ask the user to paste the key into chat or commit it to source control.

## Step 3 — Configure Cursor MCP

Walk the user through **Cursor Settings → Tools & MCP**:

1. Find the **`context_dev_api`** server (installed with this plugin).
2. Set the API key using **one** of:
   - Header **`x-context-dev-api-key`**: paste the `ctxt_secret_...` value directly, **or**
   - Environment variable **`CONTEXT_DEV_API_KEY`** if Cursor resolves `${CONTEXT_DEV_API_KEY}` from the shell (see macOS note below).
3. Enable the server and restart Cursor if tools still fail.

Reference config:

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

### macOS environment-variable gotcha

If using `${CONTEXT_DEV_API_KEY}` in MCP config, Cursor must inherit the variable from the shell. Either:

- Launch Cursor from a terminal where the key is exported:
  ```bash
  export CONTEXT_DEV_API_KEY="ctxt_secret_..."
  open -a Cursor
  ```
- Or paste the key directly into the MCP header field instead of relying on env substitution.

## Step 4 — Verify the connection

Run a lightweight MCP call via `execute`:

```ts
const res = await client.brand.retrieveSimplified({ domain: 'stripe.com' });
return {
  title: res.brand?.title,
  colors: res.brand?.colors?.map((c) => c.hex),
  credits_remaining: res.key_metadata?.credits_remaining,
};
```

Confirm:

- Stripe brand data returns (not a training-data guess)
- `key_metadata.credits_remaining` is present

If verification fails, see troubleshooting below.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| 401 on every call | Re-check key in MCP settings; confirm it starts with `ctxt_secret_` and wasn't revoked |
| MCP server disabled | Enable `context_dev_api` in Cursor Settings → Tools & MCP |
| Env var not picked up | Paste key into header field, or relaunch Cursor from a shell with `CONTEXT_DEV_API_KEY` set |
| 403 `USAGE_EXCEEDED` | Quota exhausted — check [pricing](https://context.dev/pricing) or dashboard |
| Tools missing entirely | Restart Cursor; confirm plugin is installed and MCP config matches plugin `mcp.json` |

## Links

- [Authentication guide](https://docs.context.dev/guides/get-started/authentication)
- [MCP install guide](https://docs.context.dev/install-mcp)
- [Troubleshooting](https://docs.context.dev/optimization/troubleshooting)
