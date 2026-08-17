#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const expectedPluginName = "context-dev";
const expectedMcpUrl = "https://mcp.context.dev/mcp";
const errors = [];
const componentNames = new Map();
const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const componentNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const semanticVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const staleInstructionPatterns = [
  ["retired MCP hostname", /context-dev\.stlmcp\.com/i],
  ["legacy MCP server name", /context_dev_api/],
  ["retired code-mode search tool", /\bsearch_docs\b/],
  ["retired code-mode SDK execution", /client\.(?:brand\.retrieveSimplified|web\.webScrapeMd)/],
  ["retired MCP API-key header", /x-context-dev-api-key/i],
];

function addError(message) {
  errors.push(message);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filePath, label) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    addError(`${label} is missing or invalid (${path.relative(repoRoot, filePath)}): ${error.message}`);
    return null;
  }
}

function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return null;
  }

  const closingIndex = normalized.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return null;
  }

  const fields = {};
  for (const line of normalized.slice(4, closingIndex).split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1 || /^\s/.test(line)) {
      continue;
    }
    fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return fields;
}

async function walkFiles(dirPath) {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  const files = [];
  const pending = [dirPath];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }
  return files.sort();
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || path.isAbsolute(value)) {
    return false;
  }
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return normalized !== ".." && !normalized.startsWith("../");
}

async function validateReferencedPath(fieldName, value) {
  if (value.startsWith("https://")) {
    return;
  }
  if (!isSafeRelativePath(value)) {
    addError(`plugin.json field "${fieldName}" must use a safe relative path: ${value}`);
    return;
  }
  if (!(await pathExists(path.resolve(repoRoot, value)))) {
    addError(`plugin.json field "${fieldName}" references a missing path: ${value}`);
  }
}

async function validateManifest() {
  const manifestPath = path.join(repoRoot, ".cursor-plugin", "plugin.json");
  const manifest = await readJsonFile(manifestPath, "Plugin manifest");
  if (!manifest) {
    return;
  }

  if (manifest.name !== expectedPluginName || !pluginNamePattern.test(manifest.name ?? "")) {
    addError(`plugin.json name must be "${expectedPluginName}" and use Cursor's lowercase identifier format.`);
  }
  if (typeof manifest.displayName !== "string" || !manifest.displayName.trim()) {
    addError("plugin.json must include a non-empty displayName.");
  }
  if (!semanticVersionPattern.test(manifest.version ?? "")) {
    addError("plugin.json version must be semantic versioning in x.y.z form.");
  }
  if (typeof manifest.description !== "string" || manifest.description.trim().length < 20) {
    addError("plugin.json must include a useful description.");
  }
  if (typeof manifest.author?.name !== "string" || !manifest.author.name.trim()) {
    addError("plugin.json must include author.name.");
  }
  for (const field of ["homepage", "repository"]) {
    try {
      const parsed = new URL(manifest[field]);
      if (parsed.protocol !== "https:") {
        addError(`plugin.json ${field} must be an HTTPS URL.`);
      }
    } catch {
      addError(`plugin.json ${field} must be a valid URL.`);
    }
  }
  if (!Array.isArray(manifest.keywords) || manifest.keywords.length < 3) {
    addError("plugin.json must include at least three discovery keywords.");
  }

  for (const field of ["logo", "rules", "skills", "agents", "commands", "hooks", "mcpServers"]) {
    const value = manifest[field];
    if (value === undefined) {
      continue;
    }
    const references = Array.isArray(value) ? value : [value];
    for (const reference of references) {
      if (typeof reference !== "string") {
        addError(`plugin.json field "${field}" must contain string paths in this plugin.`);
      } else {
        await validateReferencedPath(field, reference);
      }
    }
  }

  if (manifest.mcpServers !== "./mcp.json") {
    addError('plugin.json mcpServers must reference "./mcp.json".');
  }
}

async function validateMcpConfig() {
  const mcpConfig = await readJsonFile(path.join(repoRoot, "mcp.json"), "MCP config");
  if (!mcpConfig) {
    return;
  }

  const serverNames = Object.keys(mcpConfig.mcpServers ?? {});
  if (serverNames.length !== 1 || serverNames[0] !== "context") {
    addError('mcp.json must define exactly one server named "context".');
    return;
  }

  const contextServer = mcpConfig.mcpServers.context;
  if (contextServer?.url !== expectedMcpUrl) {
    addError(`mcpServers.context.url must be "${expectedMcpUrl}".`);
  }
  const serverFields = Object.keys(contextServer ?? {}).sort();
  if (serverFields.length !== 1 || serverFields[0] !== "url") {
    addError("The Context MCP config must rely on OAuth discovery and contain only its URL; remove headers, embedded credentials, and custom auth fields.");
  }
}

async function validateFrontmatterFile(filePath, kind, expectedName) {
  const relativeFile = path.relative(repoRoot, filePath);
  const fields = parseFrontmatter(await fs.readFile(filePath, "utf8"));
  if (!fields) {
    addError(`${kind} file is missing YAML frontmatter: ${relativeFile}`);
    return;
  }
  if (!fields.description || fields.description.length === 0) {
    addError(`${kind} file is missing a description: ${relativeFile}`);
  }

  if (kind === "rule") {
    if (!new Set(["true", "false"]).has(fields.alwaysApply)) {
      addError(`rule alwaysApply must be explicitly true or false: ${relativeFile}`);
    }
    return;
  }

  if (!componentNamePattern.test(fields.name ?? "")) {
    addError(`${kind} name must be lowercase kebab-case: ${relativeFile}`);
    return;
  }
  if (fields.name !== expectedName) {
    addError(`${kind} name "${fields.name}" must match its path name "${expectedName}": ${relativeFile}`);
  }
  const previous = componentNames.get(fields.name);
  if (previous) {
    addError(`duplicate component name "${fields.name}" in ${previous} and ${relativeFile}`);
  } else {
    componentNames.set(fields.name, relativeFile);
  }
}

async function validateComponents() {
  const ruleFiles = (await walkFiles(path.join(repoRoot, "rules"))).filter((file) => [".md", ".mdc", ".markdown"].includes(path.extname(file).toLowerCase()));
  const skillFiles = (await walkFiles(path.join(repoRoot, "skills"))).filter((file) => path.basename(file) === "SKILL.md");
  const commandFiles = (await walkFiles(path.join(repoRoot, "commands"))).filter((file) => [".md", ".mdc", ".markdown", ".txt"].includes(path.extname(file).toLowerCase()));

  if (ruleFiles.length !== 2) {
    addError(`expected 2 rules but found ${ruleFiles.length}.`);
  }
  if (skillFiles.length !== 3) {
    addError(`expected 3 skills but found ${skillFiles.length}.`);
  }
  if (commandFiles.length !== 4) {
    addError(`expected 4 commands but found ${commandFiles.length}.`);
  }

  for (const file of ruleFiles) {
    await validateFrontmatterFile(file, "rule");
  }
  for (const file of skillFiles) {
    await validateFrontmatterFile(file, "skill", path.basename(path.dirname(file)));
  }
  for (const file of commandFiles) {
    await validateFrontmatterFile(file, "command", path.basename(file, path.extname(file)));
  }
}

async function validateInstructionsAreCurrent() {
  const files = [
    "mcp.json",
    "README.md",
    ...((await walkFiles(path.join(repoRoot, "commands"))).map((file) => path.relative(repoRoot, file))),
    ...((await walkFiles(path.join(repoRoot, "rules"))).map((file) => path.relative(repoRoot, file))),
    "skills/connect-context-dev/SKILL.md",
  ];

  for (const relativeFile of files) {
    const content = await fs.readFile(path.join(repoRoot, relativeFile), "utf8");
    for (const [label, pattern] of staleInstructionPatterns) {
      if (pattern.test(content)) {
        addError(`${relativeFile} contains ${label}.`);
      }
    }
  }

  const commandToolRequirements = new Map([
    ["commands/brand-colors.md", "get-brand"],
    ["commands/scrape-url.md", "web-scrape-markdown"],
    ["commands/search-web.md", "web-search"],
    ["commands/extract-web-data.md", "web-extract"],
  ]);
  for (const [relativeFile, toolName] of commandToolRequirements) {
    const content = await fs.readFile(path.join(repoRoot, relativeFile), "utf8");
    if (!content.includes(`\`${toolName}\``)) {
      addError(`${relativeFile} must call the direct MCP tool ${toolName}.`);
    }
  }
}

async function validateRequiredFiles() {
  for (const relativeFile of ["README.md", "LICENSE", "assets/logo.svg"]) {
    if (!(await pathExists(path.join(repoRoot, relativeFile)))) {
      addError(`${relativeFile} is missing.`);
    }
  }
}

function summarizeAndExit() {
  if (errors.length > 0) {
    console.error("Validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
  console.log("Validation passed: manifest, MCP OAuth config, components, and current tool instructions are consistent.");
}

await validateManifest();
await validateMcpConfig();
await validateComponents();
await validateInstructionsAreCurrent();
await validateRequiredFiles();
summarizeAndExit();
