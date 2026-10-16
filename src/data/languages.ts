import type { LanguageRecord } from "../types.js";

/**
 * Seed language registry.
 *
 * VERIFIED entries have validated ISO 639-3 codes and documented classification.
 * UNVERIFIED entries are names that were investigated and NOT confirmed as
 * distinct Nigerian languages. They are retained (flagged) so callers can
 * explain why a requested name is unavailable — they MUST NEVER be surfaced
 * as authoritative coverage.
 */
export const SEED_LANGUAGES: LanguageRecord[] = [
  {
    id: "hau",
    name: "Hausa",
    iso639_3: "hau",
    glottocode: "haus1257",
    regions: ["Northern Nigeria"],
    dialects: ["Kano", "Daura", "Sokoto", "Zazzau"],
    status: "verified",
    sources: ["ISO 639-3 registry (hau)", "Ethnologue/Glottolog classification: Chadic, Afro-Asiatic"],
  },
  {
    id: "yor",
    name: "Yoruba",
    iso639_3: "yor",
    glottocode: "yoru1245",
    regions: ["South-West Nigeria"],
    dialects: ["Egba", "Ijebu", "Oyo"],
    status: "verified",
    sources: ["ISO 639-3 registry (yor)", "Glottolog classification: Volta-Niger, Niger-Congo"],
  },
  {
    id: "ibo",
    name: "Igbo",
    iso639_3: "ibo",
    glottocode: "igbo1246",
    regions: ["South-East Nigeria"],
    dialects: ["Onitsha", "Owerri", "Ngwa", "Ohuhu"],
    status: "verified",
    sources: ["ISO 639-3 registry (ibo)", "Glottolog classification: Volta-Niger, Niger-Congo"],
  },
  {
    id: "tiv",
    name: "Tiv",
    iso639_3: "tiv",
    glottocode: "tivy1234",
    regions: ["Benue", "Nasarawa", "Taraba", "Plateau", "Cross River"],
    dialects: [],
    status: "verified",
    sources: [
      "ISO 639-3 registry (tiv)",
      "Tiv language belongs to the Benue-Congo branch of Niger-Congo; ~8M speakers (Wikipedia: Tiv people)",
    ],
    notes: "Historically (and derogatorily) recorded as 'Munchi/Munshi' by Fulani and colonial authors; that name must not be used.",
  },
  {
    id: "fuv",
    name: "Nigerian Fulfulde (Fulani)",
    iso639_3: "fuv",
    regions: ["Northern Nigeria", "Adamawa", "Sokoto"],
    dialects: ["Sokoto", "Adamawa", "Borgu"],
    status: "verified",
    sources: ["ISO 639-3 registry (fuv)", "Classification: Senegambian/Fula, Atlantic-Congo"],
  },
  {
    id: "kau",
    name: "Kanuri",
    iso639_3: "kau",
    regions: ["Borno", "Yobe"],
    dialects: ["Maiduguri (Yerwa)"],
    status: "verified",
    sources: ["ISO 639-3 registry (kau)", "Classification: Saharan (Nilo-Saharan)"],
  },
  {
    id: "ibb",
    name: "Ibibio",
    iso639_3: "ibb",
    regions: ["Akwa Ibom"],
    dialects: ["Uyo"],
    status: "verified",
    sources: ["ISO 639-3 registry (ibb)", "Classification: Lower Cross, Niger-Congo"],
  },
  {
    id: "bin",
    name: "Edo (Bini)",
    iso639_3: "bin",
    regions: ["Edo State"],
    dialects: [],
    status: "verified",
    sources: ["ISO 639-3 registry (bin)", "Classification: Edoid, Niger-Congo"],
  },
  // ---- Investigated and NOT confirmed as Nigerian languages ----
  {
    id: "galla",
    name: "Galla (requested name)",
    regions: [],
    dialects: [],
    status: "unverified",
    sources: [
      "Dictionary.com: 'Galla' is a former name for the Oromo people of Ethiopia/Kenya, common in historical texts through the early 20th century, never used by the Oromo themselves and now considered derogatory.",
    ],
    notes:
      "NOT a Nigerian language. 'Galla' is an obsolete and derogatory exonym for the Oromo (Cushitic, Afro-Asiatic). Any request to localize 'Galla' must be redirected to Oromo (iso639-3: orm) or clarified with the requester. Do not create authoritative records under this name.",
  },
  {
    id: "doma",
    name: "Doma (requested name)",
    regions: ["Nasarawa State"],
    dialects: [],
    status: "unverified",
    sources: [
      "Wikipedia disambiguation: 'Doma, Nigeria' is a Local Government Area in Nasarawa State — a place, not a documented language.",
    ],
    notes:
      "No validated language identity found. Doma is an LGA in Nasarawa; the area's languages include Eggon, Tiv, and Hausa. Requires field verification before any dictionary or resource bundle is created. Do not present as a language.",
  },
  {
    id: "gidi",
    name: "Gidi (requested name)",
    regions: ["Lagos"],
    dialects: [],
    status: "unverified",
    sources: [
      "Naijalingo: 'Lasgidi' or 'gidi' is Nigerian Pidgin slang for Lagos (the former capital), not a language.",
    ],
    notes:
      "NOT a language. 'Gidi' is slang for Lagos. If a requester means Lagos Pidgin or Yoruba (Lagos dialects), route them to pcm (Nigerian Pidgin) or yor. Do not create authoritative records.",
  },
];
