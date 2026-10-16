/** Verification status of a language record. Never present unverified data as authoritative. */
export type VerificationStatus = "verified" | "unverified" | "pending-review";

/** ISO 639-3 reference when the language has a validated code. */
export interface LanguageRecord {
  /** Stable engine ID, e.g. "tiv" */
  id: string;
  /** Endonym or most common name, e.g. "Tiv" */
  name: string;
  /** ISO 639-3 code if validated; absent otherwise. */
  iso639_3?: string;
  /** Glottocode if validated. */
  glottocode?: string;
  /** Region hints within Nigeria (informative only). */
  regions: string[];
  /** Known dialect names — informative, not exhaustive. */
  dialects: string[];
  status: VerificationStatus;
  /** Human-readable provenance for the record itself. */
  sources: string[];
  /** Notes on classification uncertainty. */
  notes?: string;
}

export interface DictionaryEntry {
  id: string;
  languageId: string;
  term: string;
  partOfSpeech?: string;
  meanings: string[];
  /** Origin of the entry: "curated" or "community". */
  origin: "curated" | "community";
  status: "approved" | "draft" | "rejected";
  sources: string[];
}

/** Machine-generated translations are always drafts pending review. */
export interface Translation {
  sourceText: string;
  sourceLocale: string;
  targetLocale: string;
  text: string;
  generatedBy: "provider" | "memory" | "human";
  /** Identifies the provider that produced the original machine draft. */
  providerId?: string;
  /** Always true for provider/memory output; false only after validated review. */
  requiresReview: boolean;
  reviewerId?: string;
  reviewApprovalId?: string;
  reviewedAt?: string;
}

export interface TranslationReviewValidationRequest {
  reviewerId: string;
  approvalId: string;
  sourceText: string;
  sourceLocale: string;
  targetLocale: string;
  translatedText: string;
}

/** Host implementation must verify an authenticated editor and durable approval record. */
export interface TranslationReviewValidator {
  isAuthorizedTranslationReview(input: TranslationReviewValidationRequest): boolean;
}

/** Replaceable translation provider contract. Implementations must be stateless per call. */
export interface TranslationProvider {
  readonly id: string;
  translate(input: {
    text: string;
    sourceLocale: string;
    targetLocale: string;
  }): Promise<Translation>;
}

/** Community submission for dictionary terms or localized resources. */
export interface CommunitySubmission {
  id: string;
  languageId: string;
  kind: "dictionary" | "resource";
  payload: DictionaryEntry | { key: string; value: string };
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewer?: string;
  reviewNotes?: string;
}

export interface CommunityReviewAuthorizationRequest {
  reviewerId: string;
  submissionId: string;
  languageId: string;
  kind: CommunitySubmission["kind"];
  decision: "approved" | "rejected";
}

/** Host implementation must map reviewerId to an authenticated, authorized editor. */
export interface CommunityReviewAuthorizer {
  isAuthorizedReviewer(input: CommunityReviewAuthorizationRequest): boolean;
}

/** Host applications must authenticate/authorize reviewers before review(). */
export interface ReviewWorkflow {
  submit(submission: CommunitySubmission): Promise<CommunitySubmission>;
  review(
    submissionId: string,
    decision: "approved" | "rejected",
    reviewer: string,
    notes?: string,
  ): Promise<CommunitySubmission>;
}
