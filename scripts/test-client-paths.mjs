import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PATHS } from "../dist/constants.js";
import { peekConfig } from "../dist/services/config.js";
import { RappiClient } from "../dist/services/rappi-client.js";
import { TokenStore } from "../dist/services/token-store.js";

const home = mkdtempSync(join(tmpdir(), "rappi-client-paths-"));
const tokenPath = join(home, ".rappi-mcp", "tokens.json");
mkdirSync(join(home, ".rappi-mcp"), { recursive: true, mode: 0o700 });
writeFileSync(tokenPath, JSON.stringify({ access_token: "fixture-token", source: "user" }), { mode: 0o600 });
process.env.HOME = home;
process.env.RAPPI_TOKEN_PATH = tokenPath;
process.env.RAPPI_DEVICE_ID = "11111111-1111-1111-1111-111111111111";
delete process.env.RAPPI_ACCESS_TOKEN;
delete process.env.RAPPI_ALLOW_MUTATIONS;

const captured = [];

function headerMap(headers) {
  if (!headers) return {};
  if (typeof headers.forEach === "function") {
    const out = {};
    headers.forEach((value, key) => {
      out[String(key).toLowerCase()] = String(value);
    });
    return out;
  }
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)]));
}

const fetchImpl = async (url, init = {}) => {
  captured.push({
    url: String(url),
    method: String(init.method || "GET").toUpperCase(),
    headers: headerMap(init.headers)
  });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};

const config = peekConfig(process.env, home);
const tokens = new TokenStore(tokenPath);
const client = new RappiClient(config, tokens, fetchImpl);

await client.searchStores({ query: "leite", latitude: -3.7, longitude: -38.5 });
await client.getCart();
await client.listAddresses();
await client.listOrders();

function hit(suffix, method) {
  return captured.find((row) => row.url === `${config.apiBase}${suffix}` && row.method === method);
}

assert.ok(hit(PATHS.search, "POST"), `search must POST ${PATHS.search}, got ${JSON.stringify(captured)}`);
assert.ok(hit(PATHS.cart, "POST"), `cart inspect must POST ${PATHS.cart} (GET 502s before auth)`);
assert.equal(Boolean(hit(PATHS.cart, "GET")), false, "cart inspect must not GET (live GET is 502 Bad Gateway)");
assert.ok(hit(PATHS.addresses, "GET"), `addresses must GET ${PATHS.addresses}`);
assert.ok(hit(PATHS.orders, "GET"), `orders must GET ${PATHS.orders}`);

assert.equal(PATHS.search, "/api/pns-global-search-api/v1/unified-search");
assert.equal(PATHS.cart, "/api/ms/shopping-cart/v1/all/get");
assert.equal(PATHS.addresses, "/api/ms/users-address/addresses");
assert.equal(PATHS.orders, "/api/user-order-home/orders");

for (const row of captured) {
  assert.match(row.headers.deviceid || "", /11111111/);
  assert.equal(row.headers.origin, "https://www.rappi.com.br");
  assert.ok(row.headers["x-application-id"], "x-application-id required");
  assert.equal(row.headers.vendor, "web");
  assert.doesNotMatch(row.url, /\/api\/ms\/cart\//);
  assert.doesNotMatch(row.url, /\/api\/ms\/user-addresses/);
  assert.doesNotMatch(row.url, /\/api\/ms\/user-orders/);
  assert.doesNotMatch(row.url, /search-proxy/);
  assert.doesNotMatch(row.url, /web-proxy\/dynamic-list/);
}

const guestHome = mkdtempSync(join(tmpdir(), "rappi-guest-"));
process.env.HOME = guestHome;
process.env.RAPPI_TOKEN_PATH = join(guestHome, ".rappi-mcp", "tokens.json");
process.env.RAPPI_DEVICE_ID = "22222222-2222-2222-2222-222222222222";
mkdirSync(join(guestHome, ".rappi-mcp"), { recursive: true, mode: 0o700 });
const guestCaptured = [];
const guestFetch = async (url, init = {}) => {
  const headers = headerMap(init.headers);
  guestCaptured.push({ url: String(url), method: String(init.method || "GET").toUpperCase(), headers });
  if (String(url).includes("passport")) {
    return new Response(JSON.stringify({ token: "passport-guest-key" }), { status: 200 });
  }
  return new Response(JSON.stringify({ access_token: "guest-access" }), { status: 200 });
};
const guestConfig = peekConfig(process.env, guestHome);
const guestClient = new RappiClient(guestConfig, new TokenStore(guestConfig.tokenPath), guestFetch);
await guestClient.guestToken();
assert.ok(guestCaptured.some((row) => row.url.endsWith(PATHS.guestPassport) && row.method === "GET"));
const guestPost = guestCaptured.find((row) => row.url.endsWith(PATHS.guest) && row.method === "POST");
assert.ok(guestPost, "guest POST must hit /api/rocket/v2/guest");
assert.equal(guestPost.headers["x-guest-api-key"], "passport-guest-key");
assert.ok(guestPost.headers.deviceid);

console.log(
  JSON.stringify(
    {
      ok: true,
      suite: "client-paths",
      search: PATHS.search,
      cart: PATHS.cart,
      addresses: PATHS.addresses,
      orders: PATHS.orders,
      captured: captured.map((row) => `${row.method} ${row.url.replace(config.apiBase, "")}`)
    },
    null,
    2
  )
);
