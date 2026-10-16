# nigerian-language-engine

Whole-application localization and language registry engine for Nigerian languages. TypeScript, provider-independent, independently versioned and distributable.

## Status: ALPHA — first implementation pass (awaiting independent audit)

Built by Mistral Vibe as the primary implementation pass; a separate agent (Manus) audits, corrects, and finalizes. See `HANDOFF_TO_MANUS.md`.

## Modules

| Module | Purpose | Status |
| --- | --- | --- |
| `registry` | Language/dialect registry, locale resolution, verified-coverage filtering | Implemented, tested |
| `data/languages` | Seed records with provenance; Tiv verified (ISO 639-3 `tiv`); "Galla", "Doma", "Gidi" investigated and flagged unverified with reasons | Implemented, tested |
| `translation` | `TranslationProvider` abstraction + exact-match translation memory; machine output is always draft (requiresReview) | Implemented, tested |
| `i18n` | Resource bundles, locale fallback chains, strict `{token}` interpolation, coverage tooling | Implemented, tested |
| `submissions` | Community submissions + review workflow (pending → approved/rejected with reviewer identity) | Implemented, tested |
| `adapters/react` | React bindings | NOT IMPLEMENTED (planned) |
| `adapters/neon` | RADARSite-compatible storage adapter | NOT IMPLEMENTED (planned) |
| `adapters/supabase` | NairaLeap-compatible storage adapter | NOT IMPLEMENTED (planned) |

## Language data policy

- Only records with validated ISO 639-3 codes and documented classification are `verified`.
- "Galla" is an obsolete, derogatory exonym for the Oromo (Ethiopia/Kenya), **not** a Nigerian language.
- "Doma" is a Local Government Area in Nasarawa State, not a documented language.
- "Gidi" is Nigerian Pidgin slang for Lagos, not a language.
- These three are kept as `unverified` records with sources and notes so applications can respond honestly, and are never counted as coverage.
- Machine-generated translations are always drafts pending human review.

## Development

```bash
npm ci
npm test        # vitest
npm run typecheck
npm run build
```

## Security

See [SECURITY.md](SECURITY.md). No credentials in code; adapters are optional and must not touch host CMS schemas.

## License

MIT.
