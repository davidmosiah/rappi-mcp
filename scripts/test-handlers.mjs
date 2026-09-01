import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TokenStore } from "../dist/services/token-store.js";
import { RappiClient } from "../dist/services/rappi-client.js";
import { peekConfig } from "../dist/services/config.js";
import {
  handleAddToCart,
  handleApplyCoupon,
  handleCancelOrder,
  handleCreateAddress,
  handleLogout,
  handlePlaceOrder,
  handleReorder,
  handleSetPaymentMethod,
  handleTipOrder
} from "../dist/services/handlers.js";

let fetches = 0;
const fetchImpl = async () => {
  fetches += 1;
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
};

const home = mkdtempSync(join(tmpdir(), "rappi-handlers-"));
const tokenPath = join(home, ".rappi-mcp", "tokens.json");
mkdirSync(join(home, ".rappi-mcp"), { recursive: true, mode: 0o700 });
writeFileSync(tokenPath, JSON.stringify({ access_token: "fixture-token", source: "user" }), { mode: 0o600 });
process.env.HOME = home;
process.env.RAPPI_TOKEN_PATH = tokenPath;
delete process.env.RAPPI_ALLOW_MUTATIONS;
delete process.env.RAPPI_ACCESS_TOKEN;

const tokens = new TokenStore(tokenPath);
const config = peekConfig(process.env, home);
const client = new RappiClient(config, tokens, fetchImpl);

fetches = 0;
const deniedMutations = await handlePlaceOrder(
  {
    address_id: "addr-1",
    payment_method_id: "pay-1",
    explicit_user_intent: true,
    response_format: "json"
  },
  { client, tokens, allowMutations: false, fetchImpl }
);
assert.equal(deniedMutations.isError, true);
assert.match(JSON.stringify(deniedMutations.structuredContent), /USER_ACTION_REQUIRED|RAPPI_ALLOW_MUTATIONS/);
assert.equal(fetches, 0, "place-order must not hit Rappi when mutations are off");

fetches = 0;
const deniedIntent = await handlePlaceOrder(
  {
    address_id: "addr-1",
    payment_method_id: "pay-1",
    explicit_user_intent: false,
    response_format: "json"
  },
  { client, tokens, allowMutations: true, fetchImpl }
);
assert.equal(deniedIntent.isError, true);
assert.match(JSON.stringify(deniedIntent.structuredContent), /explicit_user_intent/);
assert.equal(fetches, 0, "place-order must not hit Rappi without explicit_user_intent");

fetches = 0;
const deniedCart = await handleAddToCart(
  { product_id: "sku-1", quantity: 1, response_format: "json" },
  { client, tokens, allowMutations: false, fetchImpl }
);
assert.equal(deniedCart.isError, true);
assert.equal(fetches, 0);

fetches = 0;
const deniedPay = await handleSetPaymentMethod(
  { payment_method_id: "pay-1", explicit_user_intent: true, response_format: "json" },
  { client, tokens, allowMutations: false, fetchImpl }
);
assert.equal(deniedPay.isError, true);
assert.equal(fetches, 0);

const deniedLogout = await handleLogout({ response_format: "json" }, { tokens });
assert.equal(deniedLogout.isError, true);
assert.equal(existsSync(tokenPath), true, "token remains when logout is gated");

const guestPath = join(home, "guest.json");
writeFileSync(guestPath, JSON.stringify({ access_token: "g", source: "guest" }), { mode: 0o600 });
const guestTokens = new TokenStore(guestPath);
const guestClient = new RappiClient(config, guestTokens, fetchImpl);
fetches = 0;
const guestPay = await handlePlaceOrder(
  {
    address_id: "addr-1",
    payment_method_id: "pay-1",
    explicit_user_intent: true,
    response_format: "json"
  },
  { client: guestClient, tokens: guestTokens, allowMutations: true, fetchImpl }
);
assert.equal(guestPay.isError, true);
assert.match(JSON.stringify(guestPay.structuredContent), /guest/i);
assert.equal(fetches, 0);

fetches = 0;
const guestPaymentWrite = await handleSetPaymentMethod(
  { payment_method_id: "pay-1", explicit_user_intent: true, response_format: "json" },
  { client: guestClient, tokens: guestTokens, allowMutations: true, fetchImpl }
);
assert.equal(guestPaymentWrite.isError, true);
assert.match(JSON.stringify(guestPaymentWrite.structuredContent), /guest/i);
assert.equal(fetches, 0, "guest payment write must not hit Rappi");

fetches = 0;
const deniedReorder = await handleReorder(
  { order_id: "order-1", response_format: "json" },
  { client, tokens, allowMutations: false, fetchImpl }
);
assert.equal(deniedReorder.isError, true);
assert.equal(fetches, 0);

fetches = 0;
const deniedCancel = await handleCancelOrder(
  { order_id: "order-1", explicit_user_intent: true, response_format: "json" },
  { client, tokens, allowMutations: false, fetchImpl }
);
assert.equal(deniedCancel.isError, true);
assert.equal(fetches, 0);

fetches = 0;
const guestTip = await handleTipOrder(
  { order_id: "order-1", tip: 5, explicit_user_intent: true, response_format: "json" },
  { client: guestClient, tokens: guestTokens, allowMutations: true, fetchImpl }
);
assert.equal(guestTip.isError, true);
assert.match(JSON.stringify(guestTip.structuredContent), /guest/i);
assert.equal(fetches, 0);

fetches = 0;
const deniedCoupon = await handleApplyCoupon(
  { code: "PROBE", explicit_user_intent: true, response_format: "json" },
  { client, tokens, allowMutations: false, fetchImpl }
);
assert.equal(deniedCoupon.isError, true);
assert.equal(fetches, 0);

fetches = 0;
const deniedCouponIntent = await handleApplyCoupon(
  { code: "PROBE", explicit_user_intent: false, response_format: "json" },
  { client, tokens, allowMutations: true, fetchImpl }
);
assert.equal(deniedCouponIntent.isError, true);
assert.equal(fetches, 0);

fetches = 0;
const deniedAddress = await handleCreateAddress(
  {
    latitude: -3.73,
    longitude: -38.52,
    address: "Rua Teste 1",
    response_format: "json"
  },
  { client, tokens, fetchImpl }
);
assert.equal(deniedAddress.isError, true);
assert.equal(fetches, 0);

console.log(JSON.stringify({ ok: true, suite: "handlers", fetches }, null, 2));
