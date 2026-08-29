# Agent notes

Unofficial local-first Rappi MCP. Personal grocery cart for David / Life / Grok Bot.

## Commands

- `npm ci`
- `npm test` (typecheck, build, smoke, mutation gate, redaction, handlers, secret-scan)
- `npx rappi-mcp-unofficial doctor`
- `npx rappi-mcp-unofficial call rappi_capabilities --json '{}'`
- Skill: `skill/SKILL.md` (copy into the agent's skills dir; do not duplicate the API client)

## Rules

- Never commit tokens or `~/.rappi-mcp/`.
- Never enable `RAPPI_ALLOW_MUTATIONS` in default examples.
- `rappi_place_order` must stay fail-closed in tests without both gates.
- Do not add this connector to the Delx Wellness registry (grocery, not wellness).
- Live Rappi login is not required for CI.
