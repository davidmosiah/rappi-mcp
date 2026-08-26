# Security Policy

## Reporting

Report vulnerabilities privately. Never paste Rappi tokens, addresses, phone numbers, card last-four, or order dumps in public issues.

## Data this server may touch

- Personal Rappi access token in `RAPPI_ACCESS_TOKEN` or `~/.rappi-mcp/tokens.json` (0600).
- Cart, saved addresses, payment-method metadata, and order history from the unofficial consumer surface.

## Fail-closed money rules

- Default is read-only. Checkout does **not** run.
- `rappi_place_order` and `rappi_set_payment_method` require **both** `RAPPI_ALLOW_MUTATIONS` enabled and `explicit_user_intent`.
- Cart writes require the same two gates.
- Logout and address selection require `explicit_user_intent` only.
- Guest tokens cannot place orders or change payment methods.
- Default privacy mode redacts street, phone, email, and last-four.

## Local hardening

- Store tokens on a trusted machine only, outside iCloud/Dropbox.
- Do not put `RAPPI_ACCESS_TOKEN` in a committed MCP config; prefer `rappi-mcp-unofficial auth --token`.
- Keep `RAPPI_ALLOW_MUTATIONS` unset unless you intentionally want an agent to be able to charge you.
- The npm tarball does not include `~/.rappi-mcp`, `.env`, or fixtures with live credentials.

## Optional HTTP

`--http` listens on `127.0.0.1` by default. Requests with an `Origin` header must match `RAPPI_MCP_ALLOWED_ORIGIN` or `http://127.0.0.1:<port>`. Binding a non-loopback host is an operator choice; Origin checks are DNS-rebinding mitigation, not a remote multi-tenant product.

The HTTP client only calls allowlisted unofficial consumer paths (search, cart, addresses, orders, store detail, payment methods). Arbitrary URLs are rejected in-process.

## Unofficial surface

Rappi does not publish a consumer cart API. This package talks to the same undocumented web/app endpoints (`services.rappi.com.br` by default). They can change without notice. This is **not** the Rappi Partners restaurant OAuth API.
