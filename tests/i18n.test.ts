import { describe, it, expect } from "vitest";
import { LocalizationResources } from "../src/i18n.js";

describe("LocalizationResources", () => {
  it("resolves keys with locale fallback", () => {
    const res = new LocalizationResources();
    res.setFallbackChain(["en"]);
    res.addBundle("en", { greeting: "Hello", farewell: "Goodbye" });
    res.addBundle("yo", { greeting: "Pẹlẹ o" });
    expect(res.t("yo", "greeting")).toBe("Pẹlẹ o");
    expect(res.t("yo", "farewell")).toBe("Goodbye"); // falls back to en
    expect(res.t("yo", "missing")).toBeUndefined();
  });

  it("interpolates only declared params and leaves unknown tokens intact", () => {
    const res = new LocalizationResources();
    expect(res.format("Hello {name}, you have {count} alerts", { name: "Ada", count: 3 }))
      .toBe("Hello Ada, you have 3 alerts");
    expect(res.format("Hello {name}", {})).toBe("Hello {name}");
  });

  it("does not execute template syntax in parameter values", () => {
    const res = new LocalizationResources();
    const out = res.format("Hello {name}", { name: "${process.exit(1)}" });
    expect(out).toBe("Hello ${process.exit(1)}"); // treated as literal text
  });

  it("reports missing keys for coverage tooling", () => {
    const res = new LocalizationResources();
    res.addBundle("en", { a: "1", b: "2" });
    res.addBundle("yo", { a: "1" });
    expect(res.missingKeys("yo", "en")).toEqual(["b"]);
  });
});
