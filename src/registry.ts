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
    const base = locale.trim().toLowerCase().split(/[-_]/)[0];
    if (!base) return undefined;

    // The seed records use ISO 639-3 identifiers. These explicit common locale
    // aliases bridge ISO 639-1 tags without pretending they are ISO 639-3 codes.
    const aliases: Record<string, string> = { ha: "hau", ig: "ibo", yo: "yor" };
    const id = aliases[base] ?? base;
    return this.records.get(id);
  }
}
