export interface ParsedLocaleTag {
  /** Normalized lowercase form with hyphens. */
  normalized: string;
  /** Primary 2- or 3-letter language subtag. */
  base: string;
}

const scriptNames = new Intl.DisplayNames(["en"], { type: "script" });
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/**
 * Parse the simple locale forms this package currently supports: language,
 * language-region, language-script, and language-script-region. This is not a
 * full BCP-47 parser; variants and extensions are intentionally rejected.
 * Script and region subtags must also be known to the runtime's CLDR data.
 */
export function parseLocaleTag(value: unknown): ParsedLocaleTag | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase().replaceAll("_", "-");
  if (!normalized) return undefined;
  const subtags = normalized.split("-");
  const [base, ...suffixes] = subtags;
  if (!base || !/^[a-z]{2,3}$/.test(base) || suffixes.length > 2) return undefined;
  if (suffixes.some((subtag) => !subtag)) return undefined;

  let scriptSeen = false;
  let regionSeen = false;
  for (const subtag of suffixes) {
    if (/^[a-z]{4}$/.test(subtag) && !scriptSeen && !regionSeen) {
      const canonicalScript = `${subtag[0]!.toUpperCase()}${subtag.slice(1)}`;
      const scriptName = scriptNames.of(canonicalScript);
      if (!scriptName || scriptName === canonicalScript || /unknown/i.test(scriptName)) return undefined;
      scriptSeen = true;
      continue;
    }
    if ((/^[a-z]{2}$/.test(subtag) || /^\d{3}$/.test(subtag)) && !regionSeen) {
      const canonicalRegion = subtag.toUpperCase();
      const regionName = regionNames.of(canonicalRegion);
      if (!regionName || regionName === canonicalRegion || /unknown/i.test(regionName)) return undefined;
      regionSeen = true;
      continue;
    }
    return undefined;
  }
  return { normalized, base };
}
