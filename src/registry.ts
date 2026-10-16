import { parseLocaleTag } from "./locale.js";
import type { LanguageRecord, VerificationStatus } from "./types.js";

const ISO_639_1_ALIASES: Readonly<Record<string, string>> = {
  ha: "hau",
  ig: "ibo",
  yo: "yor",
};

const cloneRecord = (record: LanguageRecord): LanguageRecord => ({
  ...record,
  regions: [...record.regions],
  dialects: [...record.dialects],
  sources: [...record.sources],
});

/**
 * Registry of Nigerian languages. Records marked "unverified" or "pending-review"
 * MUST NOT be surfaced as authoritative coverage.
 */
export class LanguageRegistry {
  private records = new Map<string, LanguageRecord>();

  constructor(seed: LanguageRecord[] = []) {
    for (const record of seed) this.register(record);
  }

  register(record: LanguageRecord): void {
    if (this.records.has(record.id)) {
      throw new Error(`Language already registered: ${record.id}`);
    }
    this.records.set(record.id, cloneRecord(record));
  }

  get(id: string): LanguageRecord | undefined {
    const record = this.records.get(id);
    return record ? cloneRecord(record) : undefined;
  }

  /** Returns only records with a well-formed, matching ISO 639-3 identity and provenance. */
  verified(): LanguageRecord[] {
    return this.list().filter(
      (record) =>
        record.status === "verified" &&
        /^[a-z]{3}$/.test(record.iso639_3 ?? "") &&
        record.id === record.iso639_3 &&
        record.sources.some((source) => typeof source === "string" && source.trim().length > 0),
    );
  }

  list(): LanguageRecord[] {
    return [...this.records.values()]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(cloneRecord);
  }

  byStatus(status: VerificationStatus): LanguageRecord[] {
    return this.list().filter((record) => record.status === status);
  }

  /** Resolve supported locale forms (e.g. yo-NG, yo_Latn, ig-Latn-NG). */
  resolve(locale: string): LanguageRecord | undefined {
    const parsed = parseLocaleTag(locale);
    if (!parsed) return undefined;
    const id = ISO_639_1_ALIASES[parsed.base] ?? parsed.base;
    const record = this.records.get(id);
    return record ? cloneRecord(record) : undefined;
  }
}
