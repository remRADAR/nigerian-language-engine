# NairaLeap Integration — Nigerian Language Engine

## Status and scope

This branch documents an integration boundary; it does not add a runtime package dependency or application adapter. NairaLeap's existing integration branch adds an accessible language-status selector in the portal/editorial navigation. English is the only enabled locale; Hausa, Igbo, Yoruba, and Tiv remain pending until complete, human-reviewed NairaLeap interface dictionaries exist.

The NairaLeap frontend does **not** consume this package. The selector does not translate site content or provide a glossary. This is deliberate: the package has language records and provider/review contracts, not complete approved dictionaries or a production translation provider.

## API and safety boundaries

- `LanguageRegistry.resolve()` uses the shared strict locale parser for simple language/script/region forms such as `yo-NG`, `ig-Latn-NG`, and `ha_Latn`; unknown CLDR script/region subtags (for example `yo-XX` or `yo-Abcd`), malformed tags, and unsupported base languages return `undefined`. It intentionally rejects unimplemented BCP-47 variants/extensions instead of guessing.
- ISO 639-1 aliases `ha`, `ig`, and `yo` resolve to seeded ISO 639-3 records. Language identity/`verified` status is **not** equivalent to translation availability.
- `TranslationService` requires an injected `TranslationProvider`; machine output and memory hits are normalized to review-required drafts. No real provider is included.
- `TranslationMemory.storeReviewed()` requires a host `TranslationReviewValidator` to authenticate the editor and validate a durable approval for the exact text and locale pair. `CommunityReviewWorkflow.review()` requires a trusted `CommunityReviewAuthorizer`. The package does not authenticate users or persist audit records.
- Tiv’s verified seed identity uses ISO 639-3 `tiv` and Glottocode `tivv1240`; this is not a claim of complete dictionary or regional coverage. Galla, Doma, and Gidi remain unverified and are not counted as coverage.
- Keep English fallback; do not translate user-entered names, addresses, IDs, or free text automatically. Critical legal, financial, consent, identity, and service terminology requires human review.

## Future integration work

React adapters, persistence, searchable glossary/dictionary, complete human-reviewed NairaLeap resources, preference persistence, native-speaker review, and runtime package integration remain unimplemented. Enable no non-English locale until coverage and fallback behavior are verified across shared navigation, service portal, and supported interface text.

## Configuration and verification

No new environment variables, credentials, or live translation requests are required for the UI foundation. The focused NairaLeap Cypress spec verifies English is selected and the other options are disabled; it does not prove localization or dictionary coverage.

This stacked documentation PR targets `audit/stage-2-quality-gates`, which carries `package-lock.json`; CI includes that base as a pull-request target so `npm ci` can run. The quality-gate PR remains a prerequisite before this documentation PR can be retargeted to `main`.
