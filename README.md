# nigerian-language-engine

Provider-independent Nigerian-language registry, locale resolution, translation workflows, dictionary submissions, and review contracts. TypeScript ESM, designed for independent reuse.

## Status: ALPHA — no production provider or host identity adapter

See `HANDOFF_TO_MANUS.md` and `NAIRALEAP_INTEGRATION.md`.

## Modules

| Module | Purpose | Status |
| --- | --- | --- |
| `registry` | Language registry, supported locale resolution, verified-coverage filtering | Implemented and tested; simple language/script/region tags only; unknown CLDR script/region subtags and full BCP-47 extensions are rejected |
| `data/languages` | Seed records with provenance; Tiv uses ISO 639-3 `tiv` and Glottocode `tivv1240`; Galla/Doma/Gidi remain unverified | Implemented; not a claim of complete Nigerian-language coverage |
| `translation` | Injected provider contract and exact-match memory | Implemented; provider/cache output is draft; human-approved memory requires host validation |
| `i18n` | Resource bundles, fallback chains, strict `{token}` interpolation, coverage tooling | Implemented and tested |
| `submissions` | Community submissions and pending-to-terminal review state | In-memory only; a trusted host authorizer is mandatory for review decisions |
| React / Neon / Supabase adapters | UI and persistence integration | Not implemented |

## Data and review policy

- Only records with validated ISO 639-3 identity and documented provenance are returned as verified coverage.
- “Galla”, “Doma”, and “Gidi” remain unverified and are never counted as confirmed language coverage.
- Locale resolver supports a language subtag with optional known script and/or region (for example `yo-NG`, `yo_Latn`, `ig-Latn-NG`). Unknown script/region subtags, variants, and extensions are rejected rather than guessed or silently treated as the base language.
- Provider results are normalized to `generatedBy: "provider"` and `requiresReview: true`, regardless of provider-supplied flags.
- Untrusted memory inserts are normalized to `generatedBy: "memory"` and remain review-required. `storeReviewed()` only accepts a human-approved translation when the host-supplied `TranslationReviewValidator` confirms an authenticated editor and durable approval record.
- Community review decisions fail closed unless a host-supplied `CommunityReviewAuthorizer` validates the reviewer/action. The package itself does not authenticate submitters or reviewers and has no durable audit storage.

## Development

Runtime source targets Node.js 18+, but the current development/test toolchain (Vitest 4 and ESLint 10) requires Node.js 20.19+; CI uses Node 20.

```bash
npm ci
npm audit --audit-level=moderate
npm run lint
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

The package metadata currently declares MIT. Confirm that license choice with the owner before any package publication. No package was published as part of this work.

The root entry point and mirrored module subpaths (including `registry`, `locale`, and `data/languages`, with or without an explicit `.js` suffix) are exported for ESM consumers. The package tarball was installed into a clean consumer and those imports were smoke-tested.
