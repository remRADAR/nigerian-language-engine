import { describe, it, expect } from "vitest";
import { LanguageRegistry } from "../src/registry.js";
import { SEED_LANGUAGES } from "../src/data/languages.js";

describe("LanguageRegistry", () => {
  it("seeds only verified records as authoritative", () => {
    const reg = new LanguageRegistry(SEED_LANGUAGES);
    expect(reg.verified().every((r) => r.iso639_3)).toBe(true);
  });

  it("keeps Galla, Doma, and Gidi out of verified coverage", () => {
    const reg = new LanguageRegistry(SEED_LANGUAGES);
    const ids = reg.verified().map((r) => r.id);
    expect(ids).not.toContain("galla");
    expect(ids).not.toContain("doma");
    expect(ids).not.toContain("gidi");
    for (const id of ["galla", "doma", "gidi"]) {
      const rec = reg.get(id);
      expect(rec?.status).toBe("unverified");
      expect(rec?.sources.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("verifies Tiv with ISO 639-3 and provenance", () => {
    const reg = new LanguageRegistry(SEED_LANGUAGES);
    const tiv = reg.get("tiv");
    expect(tiv?.iso639_3).toBe("tiv");
    expect(tiv?.status).toBe("verified");
    expect(tiv?.regions).toContain("Benue");
  });

  it("resolves locale tags with region suffixes", () => {
    const reg = new LanguageRegistry(SEED_LANGUAGES);
    expect(reg.resolve("yo-NG")?.id).toBe("yor");
    expect(reg.resolve("tiv")?.id).toBe("tiv");
    expect(reg.resolve("xx")).toBeUndefined();
  });

  it("rejects duplicate registration", () => {
    const reg = new LanguageRegistry(SEED_LANGUAGES);
    expect(() => reg.register(SEED_LANGUAGES[0]!)).toThrow();
  });
});
