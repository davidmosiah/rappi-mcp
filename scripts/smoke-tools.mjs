import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const expected = [
  "rappi_add_to_cart",
  "rappi_apply_coupon",
  "rappi_browse_catalog",
  "rappi_browse_stores",
  "rappi_cancel_order",
  "rappi_capabilities",
  "rappi_checkout_preview",
  "rappi_clear_cart",
  "rappi_connection_status",
  "rappi_create_address",
  "rappi_delete_address",
  "rappi_geocode_address",
  "rappi_get_cart",
  "rappi_get_order",
  "rappi_get_order_eta",
  "rappi_get_order_invoice",
  "rappi_get_order_receipt",
  "rappi_get_order_status",
  "rappi_get_store",
  "rappi_home",
  "rappi_home_feed",
  "rappi_list_active_orders",
  "rappi_list_addresses",
  "rappi_list_coupons",
  "rappi_list_orders",
  "rappi_list_payment_methods",
  "rappi_logout",
  "rappi_order_chat",
  "rappi_place_order",
  "rappi_privacy_audit",
  "rappi_rate_order",
  "rappi_recent_searches",
  "rappi_reorder",
  "rappi_search_products",
  "rappi_search_stores",
  "rappi_set_active_address",
  "rappi_set_payment_method",
  "rappi_tip_order",
  "rappi_track_order",
  "rappi_update_address",
  "rappi_update_cart_item",
  "rappi_web_cart"
];

const homeDir = mkdtempSync(join(tmpdir(), "rappi-mcp-smoke-"));
const env = { ...process.env, HOME: homeDir };
delete env.RAPPI_ACCESS_TOKEN;
delete env.RAPPI_ALLOW_MUTATIONS;
delete env.RAPPI_TOKEN_PATH;

const client = new Client({ name: "rappi-mcp-smoke", version: "0.0.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  env
});
await client.connect(transport);
try {
  const tools = await client.listTools();
  const names = tools.tools.map((t) => t.name).sort();
  assert.deepEqual(names, expected.sort());
  for (const need of [
    "rappi_search_stores",
    "rappi_search_products",
    "rappi_get_cart",
    "rappi_list_addresses",
    "rappi_list_orders",
    "rappi_get_order",
    "rappi_list_payment_methods",
    "rappi_get_store",
    "rappi_track_order",
    "rappi_list_coupons",
    "rappi_list_active_orders",
    "rappi_checkout_preview",
    "rappi_home",
    "rappi_reorder",
    "rappi_cancel_order"
  ]) {
    assert.ok(names.includes(need), `missing ${need}`);
  }

  const place = await client.callTool({
    name: "rappi_place_order",
    arguments: {
      address_id: "addr-1",
      payment_method_id: "pay-1",
      response_format: "json"
    }
  });
  const text = JSON.stringify(place.structuredContent ?? {}) + (place.content?.map((c) => c.text || "").join("") || "");
  assert.match(text, /USER_ACTION_REQUIRED|RAPPI_ALLOW_MUTATIONS|explicit_user_intent/i);
  assert.equal(place.isError, true);

  const status = await client.callTool({
    name: "rappi_connection_status",
    arguments: { response_format: "json" }
  });
  assert.equal(status.structuredContent?.unofficial, true);
  assert.equal(status.structuredContent?.mutations_enabled, false);
  assert.equal(status.structuredContent?.never_pays_by_default, true);

  console.log(JSON.stringify({ ok: true, tools: names.length, gated_place_order: true }, null, 2));
} finally {
  await client.close();
}
