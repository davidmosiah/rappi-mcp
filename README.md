# Rappi MCP (unofficial)

Local-first MCP for **your** Rappi cart: search nearby stores and products, inspect the cart, list saved addresses, list and track orders.

**This is unofficial.** Not affiliated with, endorsed by, or supported by Rappi. Rappi does not publish a stable consumer cart API. This server talks to the same undocumented web/app endpoints (`services.rappi.com.br` by default). They can change without notice.

This is **not** the Rappi Partners / restaurant-integrations OAuth API.

## Never pays by default

Checkout, place-order, and payment-method writes **do not run** unless **both** are true:

1. `RAPPI_ALLOW_MUTATIONS=true`
2. the tool argument `explicit_user_intent: true`

Logout and address selection require `explicit_user_intent` only. Guest tokens cannot charge.

Default privacy mode (`structured`) redacts **street, phone, email, last-four**. Tokens live in `~/.rappi-mcp/tokens.json` (mode 0600). They are not in the npm tarball.

## Install (stdio)

```bash
npx -y rappi-mcp-unofficial setup
npx -y rappi-mcp-unofficial auth --token <personal-access-token>
npx -y rappi-mcp-unofficial doctor
```

Local agent / Claude Desktop / Cursor / Grok Bot:

```json
{
  "mcpServers": {
    "rappi": {
      "command": "npx",
      "args": ["-y", "rappi-mcp-unofficial"]
    }
  }
}
```

See [examples/grok-bot.md](examples/grok-bot.md). Do **not** put `RAPPI_ALLOW_MUTATIONS` in that snippet.

Optional loopback HTTP: `npx -y rappi-mcp-unofficial --http` → `POST http://127.0.0.1:3000/mcp`.

## Tools

Read: `rappi_search_stores`, `rappi_search_products`, `rappi_get_cart`, `rappi_list_addresses`, `rappi_list_orders`, `rappi_get_order`, `rappi_connection_status`, `rappi_capabilities`, `rappi_privacy_audit`.

Gated cart: `rappi_add_to_cart`, `rappi_update_cart_item`, `rappi_clear_cart`.

Gated pay: `rappi_place_order`, `rappi_set_payment_method`.

Intent-only: `rappi_logout`, `rappi_set_active_address`.

## Tests

```bash
npm test
```

No live Rappi session is required. Gates and redaction run against shipped handlers and stdio smoke.

## Env

| Name | Default |
| --- | --- |
| `RAPPI_COUNTRY` | `BR` |
| `RAPPI_API_BASE` | `https://services.rappi.com.br` |
| `RAPPI_TOKEN_PATH` | `~/.rappi-mcp/tokens.json` |
| `RAPPI_PRIVACY_MODE` | `structured` |
| `RAPPI_ALLOW_MUTATIONS` | unset / false |
| `RAPPI_LAT` / `RAPPI_LNG` | optional nearby search |
