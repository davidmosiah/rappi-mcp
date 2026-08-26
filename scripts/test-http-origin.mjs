import assert from "node:assert/strict";
import {
  defaultAllowedOrigin,
  defaultMcpBindHost,
  isAllowedMcpOrigin,
  isLoopbackHost
} from "../dist/services/http-origin.js";

assert.equal(defaultMcpBindHost({}), "127.0.0.1");
assert.equal(isLoopbackHost("127.0.0.1"), true);
assert.equal(isLoopbackHost("0.0.0.0"), false);
assert.equal(defaultAllowedOrigin("127.0.0.1", 3000, {}), "http://127.0.0.1:3000");
assert.equal(isAllowedMcpOrigin(undefined, "http://127.0.0.1:3000"), true);
assert.equal(isAllowedMcpOrigin("http://127.0.0.1:3000", "http://127.0.0.1:3000"), true);
assert.equal(isAllowedMcpOrigin("https://evil.example", "http://127.0.0.1:3000"), false);

console.log(JSON.stringify({ ok: true, suite: "http-origin" }, null, 2));
