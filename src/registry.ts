import type { LanguageRecord, VerificationStatus } from "./types.js";

/**
 * Registry of Nigerian languages. Records marked "unverified" or "pending-review"
 * MUST NOT be surfaced as authoritative coverage.
 */
export class LanguageRegistry {
  private records = new Map<string, LanguageRecord>();

  constructor(seed: LanguageRecord[] = []) {
    for (const r of seed) this.register(r);
  }

  register(record: LanguageRecord): void {
    if (this.records.has(record.id)) {
      throw new Error(`Language already registered: ${record.id}`);
    }
    this.records.set(record.id, record);
  }

  get(id: string): LanguageRecord | undefined {
    return this.records.get(id);
  }

  /** Returns only records whose identity has been validated. */
  verified(): LanguageRecord[] {
    return this.list().filter((r) => r.status === "verified");
  }

  list(): LanguageRecord[] {
    return [...this.records.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  byStatus(status: VerificationStatus): LanguageRecord[] {
    return this.list().filter((r) => r.status === status);
  }

  /** Resolve a locale tag (e.g. "yo", "yo-NG", "yo_Latn") to a record. */
  resolve(locale: string): LanguageRecord | undefined {
    const base = locale.toLowerCase().split(/[-_]/)[0];
    return this.records.get(base);
  }
}
