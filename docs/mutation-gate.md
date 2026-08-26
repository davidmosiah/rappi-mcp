# Mutation gate

`src/services/mutation-gate.ts` is the only place money rules live. Handlers call it **before** `RappiClient` HTTP.

| Tool | `RAPPI_ALLOW_MUTATIONS` | `explicit_user_intent` | Guest token |
| --- | --- | --- | --- |
| place-order / payment write / cancel / tip | required | required | rejected |
| cart add/update/clear / reorder | required | required | allowed (still no checkout) |
| address create/update/delete/select | no | required | allowed |
| rate order | no | required | allowed |
| logout | no | required | allowed |
