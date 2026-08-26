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
