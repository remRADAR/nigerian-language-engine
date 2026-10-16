import { describe, it, expect } from "vitest";
import { TranslationService, TranslationMemory } from "../src/translation.js";
import type {
  Translation,
  TranslationProvider,
  TranslationReviewValidationRequest,
  TranslationReviewValidator,
} from "../src/types.js";

/** Deterministic fake provider for tests — never a real vendor. */
const fakeProvider: TranslationProvider = {
  id: "fake-test-provider",
  async translate({ text, sourceLocale, targetLocale }) {
    return {
      sourceText: text,
      sourceLocale,
      targetLocale,
      text: `[${targetLocale}] ${text}`,
      generatedBy: "provider",
      requiresReview: true,
    } satisfies Translation;
  },
};

const draft = (overrides: Partial<Translation> = {}): Translation => ({
  sourceText: "Good morning",
  sourceLocale: "en",
  targetLocale: "yo",
  text: "Ẹ ka aaro",
  generatedBy: "provider",
  providerId: "fake-test-provider",
  requiresReview: true,
  ...overrides,
});

describe("TranslationService", () => {
  it("marks machine output as a review-required provider draft with provider provenance", async () => {
    const service = new TranslationService(fakeProvider);
    const output = await service.translate("Good morning", "en", "yo");
    expect(output.requiresReview).toBe(true);
    expect(output.generatedBy).toBe("provider");
    expect(output.providerId).toBe("fake-test-provider");
  });

  it("overrides provider-controlled human approval flags", async () => {
    const spoofingProvider: TranslationProvider = {
      id: "untrusted-provider",
      async translate({ text, sourceLocale, targetLocale }) {
        return {
          sourceText: text,
          sourceLocale,
          targetLocale,
          text: "provider output",
          generatedBy: "human",
          requiresReview: false,
        };
      },
    };
    const output = await new TranslationService(spoofingProvider).translate("Hello", "en", "yo");
    expect(output.generatedBy).toBe("provider");
    expect(output.requiresReview).toBe(true);
    expect(output.providerId).toBe("untrusted-provider");
  });

  it("uses memory on exact repeat and isolates returned objects", async () => {
    const memory = new TranslationMemory();
    const service = new TranslationService(fakeProvider, memory);
    const first = await service.translate("Good morning", "en", "yo");
    first.text = "caller mutation";
    first.requiresReview = false;
    const second = await service.translate("Good morning", "en", "yo");
    expect(second.text).toBe("[yo] Good morning");
    expect(second.generatedBy).toBe("memory");
    expect(second.requiresReview).toBe(true);
  });

  it("keeps untrusted memory inserts in draft state even if callers claim human approval", () => {
    const memory = new TranslationMemory();
    memory.store(draft({ generatedBy: "human", requiresReview: false, reviewerId: "forged-editor" }));
    const cached = memory.lookup("en", "yo", "Good morning");
    expect(cached?.generatedBy).toBe("memory");
    expect(cached?.requiresReview).toBe(true);
    expect(cached?.reviewerId).toBeUndefined();
  });

  it("preserves authenticated human-reviewed memory entries over later drafts", () => {
    const reviewedRequests: TranslationReviewValidationRequest[] = [];
    const validator: TranslationReviewValidator = {
      isAuthorizedTranslationReview(input) {
        reviewedRequests.push(input);
        return input.reviewerId === "editor-1" && input.approvalId === "approval-1";
      },
    };
    const memory = new TranslationMemory(validator);
    memory.storeReviewed(draft(), "editor-1", "approval-1");
    memory.store(draft({ text: "later provider draft" }));
    const cached = memory.lookup("en", "yo", "Good morning");
    expect(cached).toMatchObject({
      generatedBy: "human",
      requiresReview: false,
      reviewerId: "editor-1",
      reviewApprovalId: "approval-1",
    });
    expect(reviewedRequests).toHaveLength(1);
  });

  it("fails closed when no trusted translation review validator exists", () => {
    expect(() => new TranslationMemory().storeReviewed(draft(), "editor-1", "approval-1")).toThrow(/no trusted review validator/);
    const denying: TranslationReviewValidator = { isAuthorizedTranslationReview: () => false };
    expect(() => new TranslationMemory(denying).storeReviewed(draft(), "editor-1", "approval-1")).toThrow(/not validated/);
  });

  it("matches canonically equivalent Unicode while preserving source text", async () => {
    const memory = new TranslationMemory();
    const service = new TranslationService(fakeProvider, memory);
    const decomposed = "E\u0301 kaaro";
    const first = await service.translate(decomposed, "en", "yo");
    expect(first.sourceText).toBe(decomposed);
    expect(first.text).toContain(decomposed);
    const second = await service.translate("É kaaro", "en", "yo");
    expect(second.text).toBe(first.text);
    expect(second.sourceText).toBe(decomposed);
  });

  it("uses structured keys that cannot collide on locale delimiters", () => {
    const memory = new TranslationMemory();
    memory.store(draft({ sourceLocale: "a:b", targetLocale: "c", text: "first" }));
    memory.store(draft({ sourceLocale: "a", targetLocale: "b:c", text: "second" }));
    expect(memory.size()).toBe(2);
    expect(memory.lookup("a:b", "c", "Good morning")?.text).toBe("first");
    expect(memory.lookup("a", "b:c", "Good morning")?.text).toBe("second");
  });

  it("rejects malformed source and target locale tags", async () => {
    const service = new TranslationService(fakeProvider);
    await expect(service.translate("Hello", "yo-abc", "en")).rejects.toThrow(/Invalid source locale/);
    await expect(service.translate("Hello", "en", "yo-a")).rejects.toThrow(/Invalid target locale/);
    await expect(service.translate("Hello", "yo-XX", "en")).rejects.toThrow(/Invalid source locale/);
    await expect(service.translate("Hello", "en", "yo-Abcd")).rejects.toThrow(/Invalid target locale/);
  });

  it("normalizes locale aliases to a shared provider/cache key", async () => {
    const service = new TranslationService(fakeProvider);
    const output = await service.translate("Hello", "EN_us", "yo-Latn-NG");
    expect(output.sourceLocale).toBe("en-us");
    expect(output.targetLocale).toBe("yo-latn-ng");
  });

  it("rejects provider responses with mismatched request metadata", async () => {
    const provider: TranslationProvider = {
      id: "mismatched-provider",
      async translate() {
        return {
          sourceText: "different source",
          sourceLocale: "en",
          targetLocale: "yo",
          text: "incorrectly matched output",
          generatedBy: "provider",
          requiresReview: true,
        };
      },
    };
    const memory = new TranslationMemory();
    await expect(new TranslationService(provider, memory).translate("source", "en", "yo")).rejects.toThrow(/metadata/);
    expect(memory.size()).toBe(0);
  });

  it("rejects malformed provider output", async () => {
    const provider: TranslationProvider = {
      id: "malformed-provider",
      async translate() {
        return { text: "   " } as unknown as Translation;
      },
    };
    await expect(new TranslationService(provider).translate("Hello", "en", "yo")).rejects.toThrow(/empty translation/);
  });

  it("propagates provider failures without caching an entry", async () => {
    const provider: TranslationProvider = {
      id: "failing-provider",
      async translate() {
        throw new Error("provider unavailable");
      },
    };
    const memory = new TranslationMemory();
    await expect(new TranslationService(provider, memory).translate("Hello", "en", "yo")).rejects.toThrow("provider unavailable");
    expect(memory.size()).toBe(0);
  });

  it("rejects empty input and missing locale values", async () => {
    const service = new TranslationService(fakeProvider);
    await expect(service.translate("  ", "en", "yo")).rejects.toThrow(/Empty source text/);
    await expect(service.translate("Hello", " ", "yo")).rejects.toThrow(/Invalid source locale/);
    await expect(service.translate("Hello", "en", "")).rejects.toThrow(/Invalid target locale/);
  });
});
