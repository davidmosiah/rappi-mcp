---
name: rappi
description: >
  Unofficial Rappi (Brazil default) for personal grocery/delivery. Search stores
  and products, inspect cart and orders, track deliveries. Use when the user
  wants Rappi without opening the app. Prefer MCP tools if connected; otherwise
  the package CLI. Never pays unless both gates are already on and the user
  said to place this order.
---

# Rappi — skill or MCP

Unofficial. Not the Rappi Partners restaurant API.

Same binary either way. Mutation gates live in the server, not in this file.

## Choose a surface

**MCP** — tools appear natively:

```json
{ "mcpServers": { "rappi": { "command": "npx", "args": ["-y", "rappi-mcp-unofficial"] } } }
```

Do not put mutation flags in that snippet.

**Skill / CLI** — no MCP client required:

```bash
npx -y rappi-mcp-unofficial doctor --json
npx -y rappi-mcp-unofficial call rappi_capabilities --json '{}'
npx -y rappi-mcp-unofficial call rappi_search_stores --json '{"query":"leite"}'
```

If MCP tools named `rappi_*` are already available, use them. Do not also shell out.

## Setup (once)

```bash
npx -y rappi-mcp-unofficial setup
npx -y rappi-mcp-unofficial auth --from-header "Bearer …"
```

Token is a captured `Authorization` from `services.rappi.com.br`, stored at `~/.rappi-mcp/tokens.json` (0600). Guest search works without a token; checkout stays blocked.

## Loop

1. `rappi_connection_status` (or `doctor --json`). Expect `unofficial` and `never_pays_by_default`.
2. Search / home / cart / orders as asked. Street, phone, GPS, receipt images stay redacted.
3. “O que tem no carrinho?” → `rappi_get_cart`. “Pedir o de sempre” → `rappi_list_orders` then `rappi_checkout_preview`, **stop**. `rappi_reorder` only if the user named that order and both gates are already on.
4. **Stop before pay.** Do not call `rappi_place_order` (or other gated pay/cart writes) unless the user clearly asked to place **this** order. If the tool returns `USER_ACTION_REQUIRED`, report that and stop. Do not invent env flags.

## Never

- Enable mutations from this skill
- Paste tokens into git, chat logs, or the prompt
- Treat guest as able to pay
