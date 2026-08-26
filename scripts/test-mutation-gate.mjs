import assert from "node:assert/strict";
import {
  MutationGateError,
  assertCancelOrderAllowed,
  assertCartWriteAllowed,
  assertLogoutAllowed,
  assertNotGuestForCharge,
  assertPaymentWriteAllowed,
  assertPlaceOrderAllowed,
  assertReorderAllowed,
  assertTipAllowed
} from "../dist/services/mutation-gate.js";

function throws(fn, re) {
  try {
    fn();
    assert.fail("expected MutationGateError");
  } catch (error) {
    assert.equal(error instanceof MutationGateError, true);
    assert.match(error.message, re);
  }
}

throws(() => assertPlaceOrderAllowed({ allowMutations: false, explicitUserIntent: true }), /RAPPI_ALLOW_MUTATIONS/);
throws(() => assertPlaceOrderAllowed({ allowMutations: true, explicitUserIntent: false }), /explicit_user_intent/);
throws(() => assertPlaceOrderAllowed({ allowMutations: true }), /explicit_user_intent/);
assertPlaceOrderAllowed({ allowMutations: true, explicitUserIntent: true });

throws(() => assertCartWriteAllowed({ allowMutations: false, explicitUserIntent: true }), /RAPPI_ALLOW_MUTATIONS/);
throws(() => assertPaymentWriteAllowed({ allowMutations: true, explicitUserIntent: false }), /explicit_user_intent/);
throws(() => assertLogoutAllowed(false), /explicit_user_intent/);
assertLogoutAllowed(true);
throws(() => assertNotGuestForCharge("guest"), /guest token cannot place orders/i);
throws(() => assertCancelOrderAllowed({ allowMutations: false, explicitUserIntent: true }), /RAPPI_ALLOW_MUTATIONS/);
throws(() => assertTipAllowed({ allowMutations: true, explicitUserIntent: false }), /explicit_user_intent/);
throws(() => assertReorderAllowed({ allowMutations: false, explicitUserIntent: true }), /RAPPI_ALLOW_MUTATIONS/);

console.log(JSON.stringify({ ok: true, suite: "mutation-gate" }, null, 2));
