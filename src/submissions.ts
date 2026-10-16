import type {
  CommunityReviewAuthorizer,
  CommunitySubmission,
  DictionaryEntry,
  ReviewWorkflow,
} from "./types.js";

const clonePayload = (payload: CommunitySubmission["payload"]): CommunitySubmission["payload"] => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Submission payload must be an object");
  }
  if ("term" in payload) {
    return {
      ...payload,
      meanings: [...payload.meanings],
      sources: [...payload.sources],
    };
  }
  return { ...payload };
};

const cloneSubmission = (submission: CommunitySubmission): CommunitySubmission => ({
  ...submission,
  payload: clonePayload(submission.payload),
});

/**
 * In-memory community submission and review workflow. It enforces state
 * transitions, but the host must authenticate submitters and provide a trusted
 * reviewer authorizer before review decisions can be recorded.
 */
export class CommunityReviewWorkflow implements ReviewWorkflow {
  private submissions = new Map<string, CommunitySubmission>();

  constructor(private readonly reviewAuthorizer?: CommunityReviewAuthorizer) {}

  async submit(submission: CommunitySubmission): Promise<CommunitySubmission> {
    if (submission.status !== "pending") {
      throw new Error("New submissions must start as pending");
    }
    if (!submission.id?.trim()) throw new Error("Submission id is required");
    if (!submission.submittedBy?.trim()) throw new Error("Submitter identity is required");
    if (this.submissions.has(submission.id)) {
      throw new Error(`Duplicate submission id: ${submission.id}`);
    }

    const stored = cloneSubmission(submission);
    if (stored.kind === "dictionary") {
      if (!("term" in stored.payload)) {
        throw new Error("Dictionary submissions require a dictionary-entry payload");
      }
      const payload: DictionaryEntry = {
        ...stored.payload,
        origin: "community",
        status: "draft",
      };
      stored.payload = payload;
    } else if ("term" in stored.payload) {
      throw new Error("Resource submissions require a resource payload");
    }
    stored.reviewer = undefined;
    stored.reviewNotes = undefined;

    this.submissions.set(stored.id, stored);
    return cloneSubmission(stored);
  }

  async review(
    submissionId: string,
    decision: "approved" | "rejected",
    reviewer: string,
    notes?: string,
  ): Promise<CommunitySubmission> {
    if (decision !== "approved" && decision !== "rejected") {
      throw new Error("Review decision must be approved or rejected");
    }
    const current = this.submissions.get(submissionId);
    if (!current) throw new Error(`Unknown submission: ${submissionId}`);
    if (current.status !== "pending") {
      throw new Error(`Submission is already ${current.status}`);
    }
    const reviewerId = reviewer?.trim();
    if (!reviewerId) throw new Error("Reviewer identity is required");
    if (!this.reviewAuthorizer) {
      throw new Error("Community review is disabled because no trusted authorizer is configured");
    }
    if (
      this.reviewAuthorizer.isAuthorizedReviewer({
        reviewerId,
        submissionId,
        languageId: current.languageId,
        kind: current.kind,
        decision,
      }) !== true
    ) {
      throw new Error("Reviewer is not authorized for this community decision");
    }

    const updated = cloneSubmission(current);
    updated.status = decision;
    updated.reviewer = reviewerId;
    updated.reviewNotes = notes;
    if (updated.kind === "dictionary" && "term" in updated.payload) {
      updated.payload = {
        ...updated.payload,
        origin: "community",
        status: decision,
      };
    }

    this.submissions.set(submissionId, updated);
    return cloneSubmission(updated);
  }

  pending(): CommunitySubmission[] {
    return [...this.submissions.values()]
      .filter((submission) => submission.status === "pending")
      .map(cloneSubmission);
  }

  get(id: string): CommunitySubmission | undefined {
    const submission = this.submissions.get(id);
    return submission ? cloneSubmission(submission) : undefined;
  }
}
