#!/usr/bin/env node

const origin = "https://mcp.context.dev";
const mcpUrl = `${origin}/mcp`;

async function fetchWithRetry(url, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }
  throw lastError;
}

async function getJson(url) {
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return await response.json();
}

function requireValue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const health = await getJson(`${origin}/health`);
requireValue(health.status === "healthy", "MCP health response is not healthy");

const protectedResourceUrl = `${origin}/.well-known/oauth-protected-resource/mcp`;
const protectedResource = await getJson(protectedResourceUrl);
requireValue(protectedResource.resource === mcpUrl, "OAuth protected-resource metadata advertises the wrong MCP resource");
requireValue(protectedResource.authorization_servers?.includes(origin), "OAuth protected-resource metadata is missing the Context authorization server");
requireValue(protectedResource.scopes_supported?.includes("api.read"), "OAuth protected-resource metadata is missing api.read");

const authorizationServer = await getJson(`${origin}/.well-known/oauth-authorization-server`);
requireValue(authorizationServer.issuer === origin, "OAuth authorization-server issuer is incorrect");
requireValue(authorizationServer.authorization_endpoint === `${origin}/authorize`, "OAuth authorization endpoint is incorrect");
requireValue(authorizationServer.token_endpoint === `${origin}/token`, "OAuth token endpoint is incorrect");
requireValue(authorizationServer.registration_endpoint === `${origin}/register`, "OAuth dynamic client registration endpoint is missing");
requireValue(authorizationServer.code_challenge_methods_supported?.includes("S256"), "OAuth server does not advertise PKCE S256");

const initializeResponse = await fetchWithRetry(mcpUrl, {
  method: "POST",
  headers: {
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "cursor-plugin-check", version: "1.0.0" },
    },
  }),
});
requireValue(initializeResponse.status === 401, `Unauthenticated MCP initialize returned ${initializeResponse.status}, expected 401`);
const challenge = initializeResponse.headers.get("www-authenticate") ?? "";
requireValue(challenge.startsWith("Bearer "), "MCP 401 response is missing a Bearer challenge");
requireValue(challenge.includes(`resource_metadata="${protectedResourceUrl}"`), "MCP Bearer challenge does not point Cursor to OAuth metadata");

console.log("Live MCP check passed: health, OAuth discovery, DCR, PKCE, and the unauthenticated Bearer challenge are valid.");
