import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const homeDir = mkdtempSync(join(tmpdir(), "rappi-mcp-launch-"));
const env = { ...process.env, HOME: homeDir };
delete env.RAPPI_ACCESS_TOKEN;
delete env.RAPPI_ALLOW_MUTATIONS;

const client = new Client({ name: "rappi-mcp-launch", version: "0.0.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  env
});
await client.connect(transport);
try {
  const tools = await client.listTools();
  const names = tools.tools.map((t) => t.name);
  assert.ok(names.includes("rappi_place_order"));
  assert.ok(names.includes("rappi_search_stores"));
  const place = await client.callTool({
    name: "rappi_place_order",
    arguments: { address_id: "x", payment_method_id: "y", response_format: "json" }
  });
  assert.equal(place.isError, true);
  console.log(JSON.stringify({ ok: true, tools: names.length, place_order_gated: true }, null, 2));
} finally {
  await client.close();
}
