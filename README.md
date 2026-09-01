<h1 align="center">Rappi MCP</h1>

<h3 align="center">
  Give your AI agent your Rappi cart, nearby stores, orders and tracking.<br>
  Local-first MCP &mdash; <strong>credentials never leave your machine</strong>.<br>
  Checkout is <strong>fail-closed</strong> unless you opt in twice.
</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/rappi-mcp-unofficial"><img src="https://img.shields.io/npm/v/rappi-mcp-unofficial?style=for-the-badge&labelColor=0F172A&color=10B981&logo=npm&logoColor=white" alt="npm version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/LICENSE-MIT-22C55E?style=for-the-badge&labelColor=0F172A" alt="License MIT" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/BUILT_FOR-MCP-7C3AED?style=for-the-badge&labelColor=0F172A" alt="Built for MCP" /></a>
</p>

> **Unofficial.** Not affiliated with, endorsed by, or supported by Rappi. Not the Rappi Partners restaurant API. The consumer web/app surface can change without notice.

> **Never pays by default.** `rappi_place_order` and payment writes do nothing unless `RAPPI_ALLOW_MUTATIONS` is enabled **and** `explicit_user_intent` is true. Guest tokens cannot charge. Street, phone, email and last-four are redacted.

## Setup in 60 seconds

```bash
npx -y rappi-mcp-unofficial setup
npx -y rappi-mcp-unofficial auth --from-header "Bearer eyJ…"
npx -y rappi-mcp-unofficial doctor
```

Token is **not** OAuth. Open [rappi.com.br](https://www.rappi.com.br) logged in → DevTools → Network → any `services.rappi.com.br` call → copy the `Authorization` header. Guest search still works without a token; pay tools stay blocked.

Stdio snippet (Claude Desktop, Cursor, Grok Bot). Do **not** set `RAPPI_ALLOW_MUTATIONS` here:

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

See [examples/claude-desktop.json](examples/claude-desktop.json) and [examples/grok-bot.md](examples/grok-bot.md).

## Skill or MCP

Same package, two doors. MCP registers tools on stdio/HTTP. The [skill](skill/SKILL.md) is the workflow (search → compare → stop before checkout) and can drive the **same** tools through the CLI when the client has no MCP:

```bash
npx -y rappi-mcp-unofficial call rappi_search_stores --json '{"query":"leite"}'
```

Gates are identical. Copy `skill/SKILL.md` into your agent skills dir (`~/.agents/skills/rappi/` or Claude/Grok equivalent).

## Tools

| Kind | Tools |
| --- | --- |
| Read · browse | `rappi_search_stores`, `rappi_search_products`, `rappi_get_store`, `rappi_browse_stores`, `rappi_browse_catalog`, `rappi_home`, `rappi_home_feed`, `rappi_recent_searches` |
| Read · cart / pay | `rappi_get_cart`, `rappi_web_cart`, `rappi_list_payment_methods`, `rappi_list_coupons`, `rappi_checkout_preview` |
| Read · address / orders | `rappi_list_addresses`, `rappi_geocode_address`, `rappi_list_orders`, `rappi_list_active_orders`, `rappi_get_order`, `rappi_track_order`, `rappi_get_order_eta`, `rappi_get_order_receipt`, `rappi_get_order_invoice`, `rappi_get_order_status`, `rappi_order_chat` |
| Meta | `rappi_connection_status`, `rappi_capabilities` (includes `honest_gaps`; not Top5), `rappi_privacy_audit` |
| Gated cart (mutations **and** intent) | `rappi_add_to_cart`, `rappi_update_cart_item`, `rappi_clear_cart`, `rappi_reorder`, `rappi_apply_coupon` |
| Gated pay (mutations **and** intent) | `rappi_place_order`, `rappi_set_payment_method`, `rappi_cancel_order`, `rappi_tip_order` |
| Intent only | `rappi_logout`, `rappi_set_active_address`, `rappi_create_address`, `rappi_update_address`, `rappi_delete_address`, `rappi_rate_order` |

## HTTP (optional, loopback)

Default transport is **stdio**. Streamable HTTP binds `127.0.0.1` and checks `Origin` against `http://127.0.0.1:<port>` (override with `RAPPI_MCP_ALLOWED_ORIGIN`). This is DNS-rebinding mitigation, not a public server.

```bash
npx -y rappi-mcp-unofficial --http
# GET  http://127.0.0.1:3000/health
# POST http://127.0.0.1:3000/mcp
```

## Security

Tokens live in `~/.rappi-mcp/tokens.json` (0600). They are not in git, the npm tarball, or default examples. Full notes: [SECURITY.md](SECURITY.md). Agents: [llms.txt](llms.txt).

## Tests

```bash
npm test
```

No live Rappi login required.
