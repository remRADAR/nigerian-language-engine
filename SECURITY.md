# Security policy

- Report vulnerabilities via GitHub Security Advisories or the private contact in the org profile — not in issues.
- Interpolation in `i18n` is strict token lookup; do not introduce `eval`-style templating.
- Translation providers are untrusted: their output is always a draft and must be human-reviewed before publication.
- Community submissions must pass review before entering approved dictionaries.
- Adapters (Neon/Supabase) must use least-privilege credentials, separate schemas, and must never run migrations against host applications (RADARSite, NairaLeap) without separate authorization.
- Never commit credentials, private keys, or personal recordings.
