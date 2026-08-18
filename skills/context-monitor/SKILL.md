---
name: context-monitor
description: Create and manage recurring website-change monitors with Context.dev. Use when the user wants ongoing tracking, scheduled checks, alerts, change history, monitor runs, or asks to watch a page or site for future changes rather than inspect it once.
---

# Monitor website changes

Use monitors only for recurring work. For a one-time check, scrape or crawl instead.

## Workflow

1. Confirm the target, monitoring goal, schedule, and desired notification behavior.
2. Use `create-monitor` only after the user clearly asks to create ongoing monitoring. Creation immediately queues the initial baseline.
3. Do not call `run-monitor-now` immediately after creation unless the user asks for an additional run.
4. Inspect results with `list-monitor-runs`, `get-monitor-run`, `list-monitor-changes`, `list-changes`, or `get-change`.
5. Use `list-monitor-credit-usage` when the user asks about monitor consumption.

Use `list-monitors` and `get-monitor` for inspection. `update-monitor`, `delete-monitor`, and `run-monitor-now` modify external state; execute them only when the user explicitly requests that action. Prefer pausing through `update-monitor` over deletion when the user only wants checks temporarily stopped.
