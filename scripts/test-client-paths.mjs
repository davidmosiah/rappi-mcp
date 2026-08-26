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
await client.listPaymentMethods();
await client.getStore("store-1");
await client.trackOrder("order-1");
await client.getOrderEta("order-1");
await client.getOrderReceipt("order-1");
await client.getOrderInvoice("order-1");
await client.getOrderStatus("order-1");
await client.listActiveOrders();
await client.listInProgressOrders();
await client.listCoupons();
await client.checkoutPreview({ address_id: "addr-1" });
await client.home();
await client.homeFeed();
await client.browseStores();
await client.webCart();
await client.browseCatalog({ latitude: -3.7, longitude: -38.5 });
await client.recentSearches({ latitude: -3.7, longitude: -38.5 });
await client.geocodeAddress(-3.7, -38.5);

function hit(suffix, method) {
  return captured.find((row) => row.url === `${config.apiBase}${suffix}` && row.method === method);
}

assert.ok(hit(PATHS.search, "POST"), `search must POST ${PATHS.search}, got ${JSON.stringify(captured)}`);
assert.ok(hit(PATHS.cart, "POST"), `cart inspect must POST ${PATHS.cart} (GET 502s before auth)`);
assert.equal(Boolean(hit(PATHS.cart, "GET")), false, "cart inspect must not GET (live GET is 502 Bad Gateway)");
assert.ok(hit(PATHS.addresses, "GET"), `addresses must GET ${PATHS.addresses}`);
assert.ok(hit(PATHS.orders, "GET"), `orders must GET ${PATHS.orders}`);
assert.ok(hit(PATHS.paymentMethods, "GET"), `payment methods must GET ${PATHS.paymentMethods}`);
assert.ok(
  hit(`${PATHS.storeDetail}/store-1`, "GET"),
  `store detail must GET ${PATHS.storeDetail}/:id`
);
assert.ok(
  hit(`${PATHS.orders}/order-1/tracking`, "GET"),
  `tracking must GET ${PATHS.orders}/:id/tracking`
);
assert.ok(hit(`${PATHS.orders}/order-1/eta`, "GET"), "eta path");
assert.ok(hit(`${PATHS.orders}/order-1/receipt`, "GET"), "receipt path");
assert.ok(hit(`${PATHS.orders}/order-1/invoice`, "GET"), "invoice path");
assert.ok(hit(`${PATHS.orderStatus}/order-1`, "GET"), "order-status path");
assert.ok(hit(`${PATHS.orders}/active`, "GET"), "active orders");
assert.ok(hit(PATHS.ordersInProgress, "GET"), "in-progress orders");
assert.ok(hit(PATHS.coupons, "GET"), "coupons");
assert.ok(hit(PATHS.checkoutPreview, "POST"), "checkout preview POST");
assert.ok(hit(PATHS.home, "GET"), "home");
assert.ok(hit(PATHS.homeFeed, "GET"), "home feed");
assert.ok(hit(PATHS.webStores, "GET"), "web stores");
assert.ok(hit(PATHS.webCart, "GET"), "web cart");
assert.ok(hit(PATHS.catalog, "POST"), "restaurant-bus catalog POST");
assert.ok(hit(PATHS.recentSearches, "POST"), "recent searches POST");
assert.ok(
  captured.some((row) => row.method === "GET" && row.url.startsWith(`${config.apiBase}${PATHS.address}?`)),
  "geocode must GET singular address with query"
);

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
