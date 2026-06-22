#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const skillUrl = "https://docs.context.dev/skill.md";
const skillPath = path.join(repoRoot, "skills", "context-dev", "SKILL.md");

const frontmatter = `---
name: context-dev
description: Use Context.dev to resolve brands, scrape/crawl websites, extract products and structured data, and classify industries. Use when the user asks about company logos/colors, web scraping, lead enrichment, design systems, or integrating Context.dev APIs.
---
`;

async function main() {
  const response = await fetch(skillUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${skillUrl}: ${response.status} ${response.statusText}`);
  }

  let body = await response.text();
  body = body.replace(/\r\n/g, "\n").trimStart();

  if (body.startsWith("---\n")) {
    const closingIndex = body.indexOf("\n---\n", 4);
    if (closingIndex !== -1) {
      body = body.slice(closingIndex + 5);
    }
  }

  await fs.mkdir(path.dirname(skillPath), { recursive: true });
  await fs.writeFile(skillPath, `${frontmatter}\n${body.trimEnd()}\n`, "utf8");
  console.log(`Synced ${path.relative(repoRoot, skillPath)} from ${skillUrl}`);
}

await main();
