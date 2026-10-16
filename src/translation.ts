import type { Translation, TranslationProvider } from "./types.js";

export interface TranslationMemoryEntry {
  key: string; // `${sourceLocale}:${targetLocale}:${normalizedSource}`
  translation: Translation;
  hits: number;
  createdAt: string;
}

/**
 * In-memory translation memory. Exact-match only; no fuzzy matching yet
 * (tracked as outstanding work). Human-reviewed entries can be reused;
 * provider entries are reused only as drafts.
 */
export class TranslationMemory {
  private store = new Map<string, TranslationMemoryEntry>();

  private key(sourceLocale: string, targetLocale: string, text: string): string {
    const normalized = text.trim().toLowerCase();
    return `${sourceLocale}:${targetLocale}:${normalized}`;
  }

  lookup(sourceLocale: string, targetLocale: string, text: string): Translation | undefined {
    const hit = this.store.get(this.key(sourceLocale, targetLocale, text));
    if (hit) hit.hits += 1;
    return hit?.translation;
  }

  store(entry: Translation): void {
    const k = this.key(entry.sourceLocale, entry.targetLocale, entry.sourceText);
    const existing = this.store.get(k);
    // Prefer human translations over provider drafts.
    if (existing && existing.translation.generatedBy === "human") return;
    this.store.set(k, { key: k, translation: entry, hits: 0, createdAt: new Date().toISOString() });
  }

  size(): number {
    return this.store.size;
  }
}

export interface TranslateOptions {
  /** If true, memory hits are preferred over calling the provider. */
  useMemory?: boolean;
}

export class TranslationService {
  constructor(private provider: TranslationProvider, private memory = new TranslationMemory()) {}

  async translate(text: string, sourceLocale: string, targetLocale: string, opts: TranslateOptions = {}): Promise<Translation> {
    if (!text.trim()) throw new Error("Empty source text");
    if (opts.useMemory !== false) {
      const hit = this.memory.lookup(sourceLocale, targetLocale, text);
      if (hit) return hit;
    }
    const result = await this.provider.translate({ text, sourceLocale, targetLocale });
    this.memory.store(result);
    return result;
  }

  getMemory(): TranslationMemory {
    return this.memory;
  }
}
