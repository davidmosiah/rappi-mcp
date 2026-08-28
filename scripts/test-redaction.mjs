import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { applyPrivacy } from "../dist/services/privacy.js";
import { REDACTED, redactIdentity } from "../dist/services/redaction.js";

const root = dirname(fileURLToPath(new URL(".", import.meta.url)));
const fixture = JSON.parse(readFileSync(join(root, "fixtures/cart-profile.json"), "utf8"));

const structured = applyPrivacy(fixture, "structured");
assert.equal(structured.profile.email, REDACTED);
assert.equal(structured.profile.phone, REDACTED);
assert.equal(structured.profile.street, REDACTED);
assert.equal(structured.profile.address, REDACTED);
assert.equal(structured.profile.last_four, REDACTED);
assert.equal(structured.profile.lastFour, REDACTED);
assert.equal(structured.payment.last_four, REDACTED);
assert.equal(structured.cart.items[0].name, "Leite");

assert.equal(structured.location.lat, REDACTED);
assert.equal(structured.location.lng, REDACTED);
assert.equal(structured.location.latitude, REDACTED);
assert.equal(structured.location.longitude, REDACTED);
assert.equal(structured.location.polyline, REDACTED);
assert.equal(structured.location.gps, REDACTED);

const identity = redactIdentity(fixture);
assert.equal(identity.payment.card_number, REDACTED);

const summary = applyPrivacy(fixture, "summary");
assert.equal(summary.cart.items[0].name, "Leite");
assert.equal(Object.prototype.hasOwnProperty.call(summary.location ?? {}, "polyline"), false);
assert.equal(Object.prototype.hasOwnProperty.call(summary.location ?? {}, "lat"), false);

console.log(JSON.stringify({ ok: true, suite: "redaction" }, null, 2));
