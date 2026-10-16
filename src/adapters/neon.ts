/**
 * OPTIONAL ADAPTER — Neon (Postgres). Status: NOT IMPLEMENTED (planned).
 *
 * RADARSite retains its existing Neon-backed CMS. This adapter, when built,
 * must store dictionary entries / resource bundles in the plugin's own schema
 * and MUST NOT modify RADARSite's existing CMS schema or run migrations
 * against it. Schema must be derived from actual host inspection, not guessed.
 */
export const NEON_ADAPTER_STATUS = "not-implemented";
