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
