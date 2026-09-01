# Grok Bot / local agent stdio

Read-only. Do **not** set `RAPPI_ALLOW_MUTATIONS` in the Bot environment.

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

Personal token stays in `~/.rappi-mcp/tokens.json` on the machine that runs the Bot VM, or as `RAPPI_ACCESS_TOKEN` in Runtime Secrets — never in the prompt, Drive, or git.

Place-order remains listed but returns `USER_ACTION_REQUIRED` until both gates are on **and** the user set `explicit_user_intent`.

Skill path (no MCP client): copy `skill/SKILL.md` into the Bot skills dir and use `rappi-mcp-unofficial call …`. Same gates. Do not set mutation flags in the Bot environment.

Read extras: home/feed/catalog, active orders, ETA/receipt/invoice, coupons, courier chat, checkout preview (does not charge). Address create/delete need `explicit_user_intent`. Cancel/tip/place-order stay gated.

Recipe — “o que tem no carrinho agora”: `rappi_connection_status` → `rappi_get_cart` (or `rappi_web_cart`). Redacted. Stop.

Recipe — “pedir o de sempre”: `rappi_list_orders` → `rappi_checkout_preview` → **stop**. Only call `rappi_reorder` if the user named that order and both gates are already on. Never invent `RAPPI_ALLOW_MUTATIONS`.
