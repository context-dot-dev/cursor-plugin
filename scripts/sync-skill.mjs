#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const skillUrl = "https://docs.context.dev/skill.md";
const skillPath = path.join(repoRoot, "skills", "context-dev", "SKILL.md");
const checkOnly = process.argv.includes("--check");

async function fetchSkill() {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(skillUrl, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  throw new Error(`Failed to fetch ${skillUrl}: ${lastError?.message ?? "unknown error"}`);
}

async function main() {
  const body = (await fetchSkill()).replace(/\r\n/g, "\n").trim();
  if (!body.startsWith("---\n") || !body.includes("\nname: context-dev\n") || !body.includes("\ndescription:")) {
    throw new Error(`${skillUrl} did not return a valid context-dev skill`);
  }

  const expected = `${body}\n`;

  if (checkOnly) {
    const current = await fs.readFile(skillPath, "utf8");
    if (current !== expected) {
      throw new Error(`${path.relative(repoRoot, skillPath)} is stale. Run node scripts/sync-skill.mjs.`);
    }
    console.log(`${path.relative(repoRoot, skillPath)} matches ${skillUrl}`);
    return;
  }

  await fs.mkdir(path.dirname(skillPath), { recursive: true });
  await fs.writeFile(skillPath, expected, "utf8");
  console.log(`Synced ${path.relative(repoRoot, skillPath)} from ${skillUrl}`);
}

await main();
