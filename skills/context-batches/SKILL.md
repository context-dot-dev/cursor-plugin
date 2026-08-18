---
name: context-batches
description: Run and manage large asynchronous Context.dev web jobs. Use when the user needs to scrape many URLs, crawl at scale, process up to 25,000 URLs in one job, avoid synchronous timeouts, inspect batch progress or results, or cancel or delete a previously submitted batch.
---

# Run asynchronous batches

Use `submit-batch` for large URL collections or crawls that should continue asynchronously. Use direct scrape or crawl tools for small interactive requests.

## Workflow

1. Confirm whether the job is a URL scrape batch or a crawl batch.
2. Validate the target list, requested output, limits, and optional webhook before submission.
3. Supply an idempotency key when retrying a submission so a network retry cannot create a duplicate job.
4. Record the returned batch ID.
5. Check progress with `get-batch` and retrieve completed output with `get-batch-results`.
6. Use `list-batches` when the user needs to locate an existing job.

`submit-batch`, `cancel-batch`, and `delete-batch` change external state. Run them only when explicitly requested. Cancellation stops active work; deletion removes the stored batch record and must not be used as a substitute for cancellation.
