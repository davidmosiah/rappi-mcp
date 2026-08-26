# Contributing

1. Keep the default read-only. Money tools stay behind `RAPPI_ALLOW_MUTATIONS` **and** `explicit_user_intent`.
2. Tests must import shipped handlers from `dist/services/handlers.js`, not a reimplementation.
3. Do not add live Rappi credentials to fixtures.
4. Run `npm test` before opening a PR.
