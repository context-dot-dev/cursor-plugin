---
name: context-parse
description: Convert local document bytes into clean Markdown with Context.dev. Use when the user asks to parse, read, OCR, summarize, or extract text from an attached PDF, Office document, spreadsheet, image, source file, HTML file, or other supported local file.
---

# Parse documents

Use the Context.dev `parse-document` MCP tool for local file bytes. Use a scrape tool instead when the source is a web URL.

## Workflow

1. Read the target file and base64-encode its bytes into `fileBase64`.
2. Supply the file extension when known.
3. Preserve links when they matter to the requested output.
4. For PDFs, restrict the page range when the user names specific pages.
5. Enable OCR only for scanned pages or when image text is required.
6. Work from the returned Markdown for subsequent summarization or extraction.

The decoded input must not exceed 25 MiB. Do not upload unrelated files, and do not paste file contents into chat when the user only asked for a derived answer.
