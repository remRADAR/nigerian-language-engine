import { parseLocaleTag } from "./locale.js";
import type {
  Translation,
  TranslationProvider,
  TranslationReviewValidationRequest,
  TranslationReviewValidator,
} from "./types.js";

export interface TranslationMemoryEntry {
  key: string;
  translation: Translation;
  hits: number;
  createdAt: string;
}

const cloneTranslation = (translation: Translation): Translation => ({ ...translation });

/**
 * Exact-match in-memory translation cache. Untrusted inserts always become
 * review-required memory drafts. Human-approved entries require a host-supplied
 * validator backed by authenticated editorial records.
 */
export class TranslationMemory {
  private entries = new Map<string, TranslationMemoryEntry>();

  constructor(private readonly reviewValidator?: TranslationReviewValidator) {}

  private key(sourceLocale: string, targetLocale: string, text: string): string {
    const normalizedSourceLocale = sourceLocale.trim().toLowerCase().replaceAll("_", "-");
    const normalizedTargetLocale = targetLocale.trim().toLowerCase().replaceAll("_", "-");
    const normalizedSource = text.trim().normalize("NFC");
    return JSON.stringify([normalizedSourceLocale, normalizedTargetLocale, normalizedSource]);
  }

  lookup(sourceLocale: string, targetLocale: string, text: string): Translation | undefined {
    const hit = this.entries.get(this.key(sourceLocale, targetLocale, text));
    if (!hit) return undefined;
    hit.hits += 1;
    return cloneTranslation(hit.translation);
  }

  /** Store an untrusted or provider-supplied value as a review-required cache item. */
  store(entry: Translation): void {
    const key = this.key(entry.sourceLocale, entry.targetLocale, entry.sourceText);
    const existing = this.entries.get(key);
    if (existing?.translation.generatedBy === "human" && !existing.translation.requiresReview) return;
    const cached: Translation = {
      sourceText: entry.sourceText,
      sourceLocale: entry.sourceLocale,
      targetLocale: entry.targetLocale,
      text: entry.text,
      generatedBy: "memory",
      providerId: entry.providerId,
      requiresReview: true,
    };
    this.entries.set(key, {
      key,
      translation: cloneTranslation(cached),
      hits: 0,
      createdAt: new Date().toISOString(),
    });
  }

  /** Store an editor-approved entry only after a trusted host verifies its review record. */
  storeReviewed(entry: Translation, reviewerId: string, approvalId: string): void {
    if (!this.reviewValidator) {
      throw new Error("Reviewed translation storage is disabled because no trusted review validator is configured");
    }
    if (!reviewerId?.trim() || !approvalId?.trim()) {
      throw new Error("Reviewed translations require reviewer and approval identities");
    }
    if (!entry.sourceText?.trim() || !entry.text?.trim()) {
      throw new Error("Reviewed translation source and target text are required");
    }
    const request: TranslationReviewValidationRequest = {
      reviewerId: reviewerId.trim(),
      approvalId: approvalId.trim(),
      sourceText: entry.sourceText,
      sourceLocale: entry.sourceLocale,
      targetLocale: entry.targetLocale,
      translatedText: entry.text,
    };
    if (this.reviewValidator.isAuthorizedTranslationReview(request) !== true) {
      throw new Error("Translation review record was not validated");
    }
    const reviewed: Translation = {
      sourceText: entry.sourceText,
      sourceLocale: entry.sourceLocale,
      targetLocale: entry.targetLocale,
      text: entry.text,
      generatedBy: "human",
      providerId: entry.providerId,
      requiresReview: false,
      reviewerId: request.reviewerId,
      reviewApprovalId: request.approvalId,
      reviewedAt: new Date().toISOString(),
    };
    const key = this.key(reviewed.sourceLocale, reviewed.targetLocale, reviewed.sourceText);
    this.entries.set(key, {
      key,
      translation: cloneTranslation(reviewed),
      hits: 0,
      createdAt: new Date().toISOString(),
    });
  }

  size(): number {
    return this.entries.size;
  }
}

export interface TranslateOptions {
  /** If true, memory hits are preferred over calling the provider. */
  useMemory?: boolean;
}

export class TranslationService {
  constructor(
    private provider: TranslationProvider,
    private memory = new TranslationMemory(),
  ) {
    if (typeof provider?.id !== "string" || !provider.id.trim()) {
      throw new Error("Translation provider must declare a non-empty id");
    }
  }

  async translate(
    text: string,
    sourceLocale: string,
    targetLocale: string,
    opts: TranslateOptions = {},
  ): Promise<Translation> {
    if (typeof text !== "string" || !text.trim()) throw new Error("Empty source text");
    const source = parseLocaleTag(sourceLocale);
    const target = parseLocaleTag(targetLocale);
    if (!source) throw new Error("Invalid source locale");
    if (!target) throw new Error("Invalid target locale");

    if (opts.useMemory !== false) {
      const hit = this.memory.lookup(source.normalized, target.normalized, text);
      if (hit) return hit;
    }

    const response: unknown = await this.provider.translate({
      text,
      sourceLocale: source.normalized,
      targetLocale: target.normalized,
    });
    if (!response || typeof response !== "object") {
      throw new Error("Translation provider returned an invalid response");
    }

    const candidate = response as Partial<Translation>;
    if (typeof candidate.text !== "string" || !candidate.text.trim()) {
      throw new Error("Translation provider returned an empty translation");
    }
    if (
      candidate.sourceText !== text ||
      candidate.sourceLocale !== source.normalized ||
      candidate.targetLocale !== target.normalized
    ) {
      throw new Error("Translation provider response metadata does not match the request");
    }

    // Provider-controlled flags are untrusted. Normalize the invariant here,
    // at the service boundary, before caching or returning the result.
    const result: Translation = {
      sourceText: text,
      sourceLocale: source.normalized,
      targetLocale: target.normalized,
      text: candidate.text,
      generatedBy: "provider",
      providerId: this.provider.id,
      requiresReview: true,
    };
    this.memory.store(result);
    return cloneTranslation(result);
  }

  getMemory(): TranslationMemory {
    return this.memory;
  }
}
