import { describe, it, expect } from "vitest";
import { LanguageRegistry } from "../src/registry.js";
import { SEED_LANGUAGES } from "../src/data/languages.js";

describe("LanguageRegistry", () => {
  it("seeds only records with validated ISO identity as authoritative", () => {
    const registry = new LanguageRegistry(SEED_LANGUAGES);
    expect(registry.verified().every((record) => record.iso639_3 === record.id)).toBe(true);
    expect(registry.verified().every((record) => record.sources.some((source) => source.trim()))).toBe(true);
  });

  it("keeps Galla, Doma, and Gidi out of verified coverage", () => {
    const registry = new LanguageRegistry(SEED_LANGUAGES);
    const ids = registry.verified().map((record) => record.id);
    expect(ids).not.toContain("galla");
    expect(ids).not.toContain("doma");
    expect(ids).not.toContain("gidi");
    for (const id of ["galla", "doma", "gidi"]) {
      const record = registry.get(id);
      expect(record?.status).toBe("unverified");
      expect(record?.sources.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("uses the validated Tiv ISO and Glottolog identifiers and source URLs", () => {
    const registry = new LanguageRegistry(SEED_LANGUAGES);
    const tiv = registry.get("tiv");
    expect(tiv?.iso639_3).toBe("tiv");
    expect(tiv?.glottocode).toBe("tivv1240");
    expect(tiv?.status).toBe("verified");
    expect(tiv?.regions).toContain("Benue");
    expect(tiv?.sources).toContain("https://iso639-3.sil.org/code/tiv");
    expect(tiv?.sources).toContain("https://glottolog.org/resource/languoid/id/tivv1240");
  });

  it.each([
    ["yo-NG", "yor"],
    ["yo_Latn", "yor"],
    ["  YO-ng  ", "yor"],
    ["ha-NG", "hau"],
    ["ig-Latn-NG", "ibo"],
    ["tiv", "tiv"],
  ])("resolves supported locale %s to %s", (locale, expectedId) => {
    const registry = new LanguageRegistry(SEED_LANGUAGES);
    expect(registry.resolve(locale)?.id).toBe(expectedId);
  });

  it.each([
    "",
    "  ",
    "xx",
    "en-US",
    "yo--NG",
    "-yo",
    "yo-",
    "yo@NG",
    "yo-a",
    "yo-abc",
    "yo-foo-bar",
    "yo-NG-Latn",
    "yo-u-ca-gregory",
    "yo-XX",
    "yo-123",
    "yo-Abcd",
    "yo-Latn-XX",
  ])("safely rejects unsupported or malformed locale %s", (locale) => {
    const registry = new LanguageRegistry(SEED_LANGUAGES);
    expect(registry.resolve(locale)).toBeUndefined();
  });

  it("safely rejects non-string values at runtime", () => {
    const registry = new LanguageRegistry(SEED_LANGUAGES);
    expect(registry.resolve(undefined as unknown as string)).toBeUndefined();
  });

  it("returns defensive copies of records", () => {
    const registry = new LanguageRegistry(SEED_LANGUAGES);
    const record = registry.get("yor");
    record?.regions.push("Unverified region");
    expect(registry.get("yor")?.regions).not.toContain("Unverified region");
  });

  it("rejects duplicate registration", () => {
    const registry = new LanguageRegistry(SEED_LANGUAGES);
    expect(() => registry.register(SEED_LANGUAGES[0]!)).toThrow();
  });
});
