import { describe, it, expect } from "vitest";
import { TranslationService, TranslationMemory } from "../src/translation.js";
import type { Translation, TranslationProvider } from "../src/types.js";

/** Deterministic fake provider for tests — never a real vendor. */
const fakeProvider: TranslationProvider = {
  id: "fake-test-provider",
  async translate({ text, sourceLocale, targetLocale }) {
    return {
      sourceText: text, sourceLocale, targetLocale,
      text: `[${targetLocale}] ${text}`,
      generatedBy: "provider",
      requiresReview: true,
    } satisfies Translation;
  },
};

describe("TranslationService", () => {
  it("marks machine output as requiring review", async () => {
    const svc = new TranslationService(fakeProvider);
    const out = await svc.translate("Good morning", "en", "yo");
    expect(out.requiresReview).toBe(true);
    expect(out.generatedBy).toBe("provider");
  });

  it("uses translation memory on exact repeat", async () => {
    const mem = new TranslationMemory();
    const svc = new TranslationService(fakeProvider, mem);
    const first = await svc.translate("Good morning", "en", "yo");
    const second = await svc.translate("Good morning", "en", "yo");
    expect(second.text).toBe(first.text);
  });

  it("prefers human-reviewed entries over provider drafts in memory", () => {
    const mem = new TranslationMemory();
    mem.store({ sourceText: "Good morning", sourceLocale: "en", targetLocale: "yo", text: "Ẹ ka aaro", generatedBy: "provider", requiresReview: true });
    mem.store({ sourceText: "Good morning", sourceLocale: "en", targetLocale: "yo", text: "Ẹ ka aaro", generatedBy: "human", requiresReview: false });
    mem.store({ sourceText: "Good morning", sourceLocale: "en", targetLocale: "yo", text: "draft", generatedBy: "provider", requiresReview: true });
    expect(mem.lookup("en", "yo", "Good morning")?.generatedBy).toBe("human");
  });

  it("rejects empty input", async () => {
    const svc = new TranslationService(fakeProvider);
    await expect(svc.translate("  ", "en", "yo")).rejects.toThrow();
  });
});
