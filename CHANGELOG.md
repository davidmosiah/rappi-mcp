## 0.1.8 - 2026-09-01

`rappi_apply_coupon` (POST `/coupons/apply`, dual-gated) and `rappi_order_chat` (GET order-status chat, 401 JSON; generic `/api/ms/chat` is 403). Receipt/image/base64/pdf/qr keys redacted. Country bases already in constants (BR/CO/MX/AR/…). OTP-style `auth start` is an honest gap (rocket OTP 404). Tip/cancel/rate remain fail-closed; live home-token proof is an honest gap without a personal token. Unofficial packages are not Top5 scorecard.

## 0.1.7 - 2026-08-28

Skill layer ships in-package (`skill/SKILL.md`). Agents can use MCP tools **or** `call <tool> --json` on the same binary; mutation gates are identical. Default docs still do not contain a copyable mutations assignment.

## 0.1.6 - 2026-08-28

Default privacy redacts GPS (`lat`/`lng`/`latitude`/`longitude`/`polyline`/`gps`) the same way as street/phone. Redaction tests cover those keys.

## 0.1.5 - 2026-08-26

Ten named OSS improvement rounds (Rappi + iFood):

1. **Rappi** — `auth --from-header` strips DevTools `Authorization: Bearer`.
2. **iFood** — `doctor --json` reports `unofficial`, `never_pays_by_default`, `auth_methods`.
3. **Rappi** — host allowlist on `consumerRequestUrl` (country Rappi hosts only).
4. **iFood** — empty/Bearer-only paste is rejected; token file stays 0600.
5. **Rappi** — token file mode 0600 asserted after shipped `auth`.
6. **iFood** — shipped CLI `auth --from-header` stores the raw JWT (no Bearer prefix).
7. **Rappi** — doctor next steps document DevTools capture; no copyable `RAPPI_ALLOW_MUTATIONS=true`.
8. **iFood** — `auth complete` without `auth start` fails closed (no pending OTP).
9. **Rappi** — `doctor --json` via `dist/index.js` asserts unofficial + never-pays.
10. **iFood** — README first screen: OTP 60s setup + WAF honesty (site-api Cloudflare / search Akamai).

### Added

- `auth --from-header` and `normalizeAccessToken`.
- Host allowlist for unofficial Rappi country bases.

### Changed

- Doctor tells you how to copy the website JWT. Guest browse still works without one.

## 0.1.4 - 2026-08-26

### Added

- Read: home, home feed, web stores, restaurant-bus catalog, recent searches, web cart, geocode, active orders, order ETA/receipt/invoice/status, coupons, checkout preview (does not charge).
- Address writes on live singular `/api/ms/users-address/address` (create/update/delete, intent-only).
- `rappi_reorder` (cart gate), `rappi_cancel_order` and `rappi_tip_order` (pay gate, guest rejected), `rappi_rate_order` (intent-only).
- Paths live-probed 200/400/401; 403 PATH_NOT_ALLOWED and 502-before-auth cart extras were not shipped.

### Fixed

- `rappi_set_active_address` now PUTs `/api/ms/users-address/address/:id` (`.../addresses/:id/select` is 404 HTML).

## 0.1.3 - 2026-08-26

### Added

- Read tools: `rappi_list_payment_methods`, `rappi_get_store`, `rappi_track_order` (paths live-probed: 401, not 403 PATH_NOT_ALLOWED).
- HTTP Origin check on optional Streamable HTTP; default bind 127.0.0.1.
- In-process consumer path allowlist so the client cannot call arbitrary URLs.

### Changed

- README first screen: unofficial, never-pay, 60-second setup, read vs gated table, loopback HTTP.

## 0.1.2 - 2026-08-26

### Fixed

- `getCart` uses POST `/api/ms/shopping-cart/v1/all/get`. Live GET on that path 502s at the edge before auth; POST returns unauthorized (path exists). Capture test forbids GET cart.

## 0.1.1 - 2026-08-26

### Fixed

- Consumer PATHS now hit real edgen-allowed routes (`pns-global-search-api/v1/unified-search`, `ms/shopping-cart/v1/all/get`, `ms/users-address/addresses`, `user-order-home/orders`) instead of 403 `PATH_NOT_ALLOWED` inventions.
- Guest auth is passport `deviceId` then `x-guest-api-key`; every request sends origin, vendor, x-application-id and deviceid.

## 0.1.0 - 2026-08-26

### Added

- Unofficial local-first Rappi MCP (stdio, optional loopback HTTP).
- Read tools: store/product search, cart, addresses, orders (identity redacted by default).
- Cart writes and place-order / payment writes fail-closed unless `RAPPI_ALLOW_MUTATIONS` and `explicit_user_intent` are both true.
- Logout and address selection require `explicit_user_intent`.
- Guest tokens cannot charge.
- Token file `~/.rappi-mcp/tokens.json` mode 0600.
