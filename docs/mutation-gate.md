# Mutation gate

`src/services/mutation-gate.ts` is the only place money rules live. Handlers call it **before** `RappiClient` HTTP.

| Tool | `RAPPI_ALLOW_MUTATIONS` | `explicit_user_intent` | Guest token |
| --- | --- | --- | --- |
| place-order / payment write | required | required | rejected |
| cart add/update/clear | required | required | allowed (still no checkout) |
| address select | no | required | allowed |
| logout | no | required | allowed |
