import type { LanguageRecord } from "./types.js";

/**
 * Whole-application localization resource store with safe interpolation.
 *
 * Interpolation deliberately does NOT use string replacement of arbitrary
 * placeholders: it uses strict `{name}` token lookup, so resource values
 * cannot inject directives or corrupt the template.
 */
export class LocalizationResources {
  private bundles = new Map<string, Map<string, string>>();
  private fallbackChain: string[] = [];

  setFallbackChain(locales: string[]): void {
    this.fallbackChain = [...locales];
  }

  addBundle(locale: string, entries: Record<string, string>): void {
    const bundle = this.bundles.get(locale) ?? new Map<string, string>();
    for (const [k, v] of Object.entries(entries)) bundle.set(k, v);
    this.bundles.set(locale, bundle);
  }

  /** Strict token interpolation: only {name} tokens declared in params are replaced. */
  format(template: string, params: Record<string, string | number> = {}): string {
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name: string) => {
      if (Object.prototype.hasOwnProperty.call(params, name)) {
        return String(params[name]);
      }
      return match; // leave unknown tokens untouched, never crash, never inject.
    });
  }

  /** Resolve a key with locale fallback. Returns undefined only when nothing in the chain has it. */
  t(locale: string, key: string, params: Record<string, string | number> = {}): string | undefined {
    const chain = this.buildChain(locale);
    for (const loc of chain) {
      const bundle = this.bundles.get(loc);
      const value = bundle?.get(key);
      if (value !== undefined) return this.format(value, params);
    }
    return undefined;
  }

  /** Missing keys in the requested locale (useful for coverage tooling). */
  missingKeys(locale: string, referenceLocale: string): string[] {
    const ref = this.bundles.get(referenceLocale) ?? new Map<string, string>();
    const target = this.bundles.get(locale) ?? new Map<string, string>();
    return [...ref.keys()].filter((k) => !target.has(k));
  }

  private buildChain(locale: string): string[] {
    // "yo-NG" -> ["yo-NG", "yo"], plus the configured fallback chain.
    const parts = locale.split(/[-_]/);
    const chain: string[] = [];
    for (let i = parts.length; i > 0; i--) {
      chain.push(parts.slice(0, i).join("-"));
    }
    return [...new Set([...chain, ...this.fallbackChain])];
  }
}

/** True only when the language record is verified; drives UI coverage badges honestly. */
export function coverageAvailable(record: LanguageRecord | undefined): boolean {
  return record?.status === "verified";
}
