## 0.1.0 - 2026-08-26

### Added

- Unofficial local-first Rappi MCP (stdio, optional loopback HTTP).
- Read tools: store/product search, cart, addresses, orders (identity redacted by default).
- Cart writes and place-order / payment writes fail-closed unless `RAPPI_ALLOW_MUTATIONS` and `explicit_user_intent` are both true.
- Logout and address selection require `explicit_user_intent`.
- Guest tokens cannot charge.
- Token file `~/.rappi-mcp/tokens.json` mode 0600.
