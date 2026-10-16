# HANDOFF TO MANUS — nigerian-language-engine

## Repository URL and branch/commit

- Repository: https://github.com/remRADAR/nigerian-language-engine
- Branch: `main`. Initial implementation pushed as the first code commit on top of the README-only init commit. Record the exact commit SHA here after auditing.
- Note: repository was created manually by the owner (the build integration could not create repositories; `403 Resource not accessible by integration`).

## Implemented modules and package boundaries

- `src/registry.ts` — `LanguageRegistry`: register/resolve/list, verified-coverage filtering.
- `src/data/languages.ts` — seed records with provenance. Tiv verified (ISO 639-3 `tiv`, Benue–Congo). **"Galla"** (obsolete derogatory exonym for Oromo), **"Doma"** (LGA in Nasarawa, not a documented language), **"Gidi"** (Pidgin slang for Lagos) are `unverified` with sources/notes — never authoritative.
- `src/translation.ts` — `TranslationProvider` interface, `TranslationMemory` (exact match, human > provider), `TranslationService`.
- `src/i18n.ts` — `LocalizationResources`: fallback chains, strict `{token}` interpolation, missing-key coverage tooling.
- `src/submissions.ts` — `CommunityReviewWorkflow`: pending → approved/rejected, reviewer identity required.
- `src/adapters/{react,neon,supabase}.ts` — explicit placeholders, NOT IMPLEMENTED.

## Commands

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

## Actual test results

- Tests were authored (vitest) but **not executed in the authoring environment — no Node runtime was available**. CI (`.github/workflows/ci.yml`) produces the first authoritative test results. Do not trust any claim of passing tests until CI runs; treat a red first CI run as expected risk and fix rather than deleting assertions.
- `npm run lint` requires ESLint config which is NOT yet present (outstanding work); the lint step may fail in CI until a config is added.

## Environment variables and provider prerequisites

- None for core. Future adapters: provider credentials via host config, never in-repo.

## Database schemas and migrations

- None implemented. Planned Neon/Supabase adapters must derive schema from actual host inspection (RADARSite = Neon CMS, NairaLeap = Supabase). Never modify host schemas.

## Security assumptions and known risks

- Provider output is untrusted draft data (requiresReview always true for machine output).
- Interpolation is strict token replacement; keep it that way.
- Review workflow is in-memory; persistence comes with adapters.
- No authN/authZ on the workflow itself yet — host applications own identity. Adapter phase must define authorization rules.

## Mocked or incomplete features

- React, Neon, Supabase adapters: placeholders.
- Translation memory: exact match only; no fuzzy matching, no TTL/eviction.
- No CLI, no dictionary import/export, no UI, no ESLint config.

## Known bugs and prioritized outstanding work

1. Run CI to get authoritative test results (first reviewer action); add ESLint config.
2. Implement Neon adapter against RADARSite inspection (separate authorization required).
3. Implement Supabase adapter for NairaLeap (separate authorization required).
4. React bindings (`LocalizationProvider`, `useLocalization`).
5. Fuzzy translation memory + storage-backed memory.
6. AuthN/authZ model for community review.
7. Curated starter dictionaries for verified languages (linguistic data acquisition — needs vetted sources, do not machine-generate).
8. Organize shared GitHub Project board across the three repos (blocked: no Projects capability in current integration).

## Reproduction instructions for the independent reviewer

```bash
git clone https://github.com/remRADAR/nigerian-language-engine.git
cd nigerian-language-engine
npm ci && npm run lint && npm run typecheck && npm test && npm run build
```

Cross-repository dependencies: article-intelligence-discussion (localized UI strings), voice-speech-engine (localized pronunciation rule packs).
