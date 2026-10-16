# NairaLeap Integration — Nigerian Language Engine

## Status and scope

This branch documents an integration boundary; it does not change the library API or add a runtime adapter. NairaLeap's current integration branch is `remRADAR/NairaLeap:integration/nairaleap-plugin-vibe`. It adds an accessible language-status selector to the portal/editorial navigation, with English active and Hausa, Igbo, Yoruba, and Tiv disabled pending complete human-reviewed interface dictionaries.

The NairaLeap frontend does **not** consume this package as a dependency. The UI does not translate content or offer a glossary. This is deliberate: the package supplies language records and translation interfaces, not complete approved NairaLeap dictionaries or a production provider.

## API and adapter guidance

- `LanguageRegistry` can resolve language records; record identity is not equivalent to translation availability.
- `TranslationService` requires an injected `TranslationProvider`; no production provider is included.
- Do not interpret `verified` language identity as a verified translation catalog.
- Preserve English fallback and keep unsupported/incomplete locales disabled.
- Do not translate user-entered names, addresses, IDs, or free text automatically.
- A React adapter, persistence, glossary, and application dictionaries are future work and require separate review.

PR [#7](https://github.com/remRADAR/nigerian-language-engine/pull/7) contains a proposed locale alias fix (ISO 639-1 `ha`, `ig`, `yo` to seeded ISO 639-3 `hau`, `ibo`, `yor`). It remains a separate open review; do not assume it is merged. Add tests for all aliases, whitespace, mixed case, underscore tags, and empty input before relying on those behaviors.

## Security/configuration

No new environment variables or credentials are required for this documentation/UI foundation. Do not add client-side provider secrets or live translation requests. Critical financial, legal, consent, identity, and service terminology requires human review before enabling a locale.

## Verification

The NairaLeap Cypress spec asserts English remains selected and all non-English options are disabled. Whole-site localization, glossary behavior, provider integration, and native-speaker review are not implemented or verified.

## CI and lockfile prerequisite

This stacked documentation PR targets `audit/stage-2-quality-gates`, which carries the committed `package-lock.json`. The quality-gate workflow now includes that base branch as a pull-request target so a fresh `npm ci` verification can run against the lockfile.
