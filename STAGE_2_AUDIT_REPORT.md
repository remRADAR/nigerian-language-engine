# Stage 2 Audit Report — Nigerian Language Engine

**Audit snapshot:** 2026-10-16. Repository `remRADAR/nigerian-language-engine`, public, default branch `main`. Baseline commit `2849d0381ff171f4a658c0b334fd48768c9af39f` was confirmed on history. Changes described below are on `audit/stage-2-quality-gates` and are not on `main`.

## Verified baseline

- Six open issues (#1–#6); no GitHub Projects board is visible to the connected integration.
- The latest Actions run on baseline SHA `2849d03` failed at `actions/setup-node@v4`: npm cache setup reported no `package-lock.json`, `npm-shrinkwrap.json`, or `yarn.lock`.
- No branch protection was returned for `main` (HTTP 404); no repository rulesets were listed.
- The package has no runtime provider implementation for translation; adapters documented as placeholders. The in-memory review workflow does not implement authentication/authorization.
- Tiv is recorded with ISO 639-3 `tiv`. Glottolog’s Tiv record corroborates Glottocode `tivv1240`, ISO code `tiv`, and classification under Tivoid / Benue-Congo. Galla, Doma, and Gidi remain explicitly `unverified`; their current source notes are not sufficient to establish further authoritative language coverage.

## Reproduced defects and changes on audit branch

- **Verified before changes:** typecheck/build failed with five TypeScript errors. `TranslationMemory` used `store` for both a map and method, causing provider translation and memory lookup failures. Locale resolution passed a possibly-undefined base tag to `Map.get` and failed the existing `yo-NG` → Yoruba test.
- **Changed on branch:** renamed the backing map to `entries`; safely reject empty/unknown locale tags and map the established `ha`, `ig`, `yo` locale aliases to Hausa, Igbo, and Yoruba.
- Added `package-lock.json`, TypeScript ESLint flat config, maintained ESLint 10 / typescript-eslint development dependencies, and CI `contents: read` permission.
- **Locally verified after changes:** `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` (4 files / 18 tests), `npm run build`, and `npm audit --omit=dev --audit-level=moderate` all pass; audit reported zero production dependency vulnerabilities.
- **Actual GitHub Actions:** PR [#7](https://github.com/remRADAR/nigerian-language-engine/pull/7), run [38878698221](https://github.com/remRADAR/nigerian-language-engine/actions/runs/38878698221), passed all workflow steps on commit `9eeef80a4c2aab19a89a259c77756e4cdf70c475`.

## Security and functional findings

- **High, unresolved:** `TranslationService` trusts provider-returned translation fields and does not independently force machine output to remain a draft requiring human review. Provider absence/failure semantics require explicit tests and normalization.
- **High, unresolved:** the community review flow accepts caller-supplied reviewer strings without authN/authZ and mutable submission references can bypass intended transition control. Do not expose as a trust boundary until host-side role enforcement and immutable/versioned state are defined.
- **Medium, unresolved:** language records cite some secondary or broad sources and do not carry precise evidence snapshots. The unverified labels stay non-authoritative; the codebase does not establish that all listed dialect/geography claims are independently vetted.
- **Medium, unresolved:** React, Neon, and Supabase adapters are placeholders, not ready-to-use production integrations.

## Status and next gate

**BLOCKED** for release/integration as an authoritative translation or review service. Local checks and the PR's GitHub Actions pass, but provider-output draft enforcement and reviewer authorization remain unresolved. PR #7 is open for review; it has not been merged. No package was published and no production system was accessed.
