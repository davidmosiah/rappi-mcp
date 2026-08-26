import assert from "node:assert/strict";
import { PATHS } from "../dist/constants.js";
import { isAllowedConsumerPath, isAllowedRappiHost } from "../dist/services/path-allowlist.js";
import { consumerRequestUrl, RappiClientError } from "../dist/services/rappi-client.js";

assert.equal(isAllowedConsumerPath(PATHS.cart), true);
assert.equal(isAllowedConsumerPath(`${PATHS.orders}/abc/tracking`), true);
assert.equal(isAllowedConsumerPath(`${PATHS.storeDetail}/1`), true);
assert.equal(isAllowedConsumerPath(`${PATHS.address}/1`), true);
assert.equal(isAllowedConsumerPath(`${PATHS.orders}/1/eta`), true);
assert.equal(isAllowedConsumerPath(PATHS.catalog), true);
assert.equal(isAllowedConsumerPath(PATHS.homeFeed), true);
assert.equal(isAllowedRappiHost("https://services.rappi.com.br/api/ms/shopping-cart/v1/all/get"), true);
assert.equal(isAllowedRappiHost("https://evil.example/api/ms/shopping-cart/v1/all/get"), false);
assert.equal(isAllowedConsumerPath("/api/ms/cart/v1/carts/current"), false);
assert.equal(isAllowedConsumerPath("https://evil.example/x"), false);
assert.equal(isAllowedConsumerPath("/api/ms/shopping-cart/v1/all/get/../evil"), false);

const base = "https://services.rappi.com.br";
assert.equal(consumerRequestUrl(base, PATHS.cart), `${base}${PATHS.cart}`);
assert.throws(
  () => consumerRequestUrl(base, "https://evil.example/steal"),
  (err) => err instanceof RappiClientError && err.code === "PATH_NOT_ALLOWED"
);
assert.throws(
  () => consumerRequestUrl(base, "/api/ms/user-orders"),
  (err) => err instanceof RappiClientError && err.code === "PATH_NOT_ALLOWED"
);
assert.throws(
  () => consumerRequestUrl("https://evil.example", PATHS.cart),
  (err) => err instanceof RappiClientError && err.code === "PATH_NOT_ALLOWED"
);

console.log(JSON.stringify({ ok: true, suite: "path-allowlist" }, null, 2));
