import type { CommunitySubmission, ReviewWorkflow } from "./types.js";

/**
 * In-memory community submission and review workflow.
 * Submissions are pending until an explicit review approves them.
 * Adapters (Neon/Supabase) replace this store; the workflow rules stay the same.
 */
export class CommunityReviewWorkflow implements ReviewWorkflow {
  private submissions = new Map<string, CommunitySubmission>();

  async submit(submission: CommunitySubmission): Promise<CommunitySubmission> {
    if (submission.status !== "pending") {
      throw new Error("New submissions must start as pending");
    }
    if (this.submissions.has(submission.id)) {
      throw new Error(`Duplicate submission id: ${submission.id}`);
    }
    this.submissions.set(submission.id, submission);
    return submission;
  }

  async review(submissionId: string, decision: "approved" | "rejected", reviewer: string, notes?: string): Promise<CommunitySubmission> {
    const s = this.submissions.get(submissionId);
    if (!s) throw new Error(`Unknown submission: ${submissionId}`);
    if (!reviewer?.trim()) throw new Error("Reviewer identity is required");
    const updated: CommunitySubmission = { ...s, status: decision, reviewer, reviewNotes: notes };
    this.submissions.set(submissionId, updated);
    return updated;
  }

  pending(): CommunitySubmission[] {
    return [...this.submissions.values()].filter((s) => s.status === "pending");
  }

  get(id: string): CommunitySubmission | undefined {
    return this.submissions.get(id);
  }
}
