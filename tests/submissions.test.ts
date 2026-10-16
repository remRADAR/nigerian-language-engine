import { describe, it, expect } from "vitest";
import { CommunityReviewWorkflow } from "../src/submissions.js";
import type { CommunityReviewAuthorizationRequest, CommunitySubmission } from "../src/types.js";

const makeSubmission = (id: string): CommunitySubmission => ({
  id,
  languageId: "yor",
  kind: "dictionary",
  payload: {
    id: `entry-${id}`,
    languageId: "yor",
    term: "àbúrò",
    meanings: ["younger sibling"],
    origin: "community",
    status: "approved",
    sources: ["submitter"],
  },
  submittedBy: "user-1",
  submittedAt: new Date().toISOString(),
  status: "pending",
});

const authorizedReviewer = {
  isAuthorizedReviewer(input: CommunityReviewAuthorizationRequest) {
    return input.reviewerId === "editor-1" && input.submissionId.length > 0;
  },
};

describe("CommunityReviewWorkflow", () => {
  it("keeps submissions pending and dictionary payloads draft until reviewed", async () => {
    const workflow = new CommunityReviewWorkflow();
    const submission = await workflow.submit(makeSubmission("s1"));
    expect(submission.status).toBe("pending");
    expect(workflow.pending()).toHaveLength(1);
    expect(submission.payload).toMatchObject({ origin: "community", status: "draft" });
    expect(workflow.get("s1")?.payload).toMatchObject({ origin: "community", status: "draft" });
  });

  it("isolates stored state from caller mutation", async () => {
    const workflow = new CommunityReviewWorkflow();
    const submitted = makeSubmission("s2");
    const returned = await workflow.submit(submitted);
    if ("term" in submitted.payload) submitted.payload.meanings[0] = "forged source mutation";
    if ("term" in returned.payload) {
      returned.payload.status = "approved";
      returned.payload.meanings.push("forged return mutation");
    }
    const stored = workflow.get("s2");
    expect(stored?.payload).toMatchObject({ status: "draft", meanings: ["younger sibling"] });
    const pending = workflow.pending();
    if (pending[0] && "term" in pending[0].payload) pending[0].payload.status = "rejected";
    expect(workflow.get("s2")?.payload).toMatchObject({ status: "draft" });
  });

  it("requires an injected authorizer and authorized reviewer before a decision", async () => {
    const workflow = new CommunityReviewWorkflow();
    await workflow.submit(makeSubmission("s3"));
    await expect(workflow.review("s3", "approved", "editor-1")).rejects.toThrow(/no trusted authorizer/);
    expect(workflow.get("s3")?.status).toBe("pending");

    const denying = new CommunityReviewWorkflow({ isAuthorizedReviewer: () => false });
    await denying.submit(makeSubmission("s4"));
    await expect(denying.review("s4", "approved", "editor-1")).rejects.toThrow(/not authorized/);
    expect(denying.get("s4")?.status).toBe("pending");
  });

  it("rejects runtime decisions outside the approved/rejected allowlist", async () => {
    const workflow = new CommunityReviewWorkflow(authorizedReviewer);
    await workflow.submit(makeSubmission("s5"));
    await expect(workflow.review("s5", "pending" as never, "editor-1")).rejects.toThrow(/must be approved or rejected/);
    expect(workflow.get("s5")?.status).toBe("pending");
  });

  it("records approval consistently on the submission and dictionary entry", async () => {
    const workflow = new CommunityReviewWorkflow(authorizedReviewer);
    await workflow.submit(makeSubmission("s6"));
    const approved = await workflow.review("s6", "approved", " editor-1 ", "matches curated entry");
    expect(approved.status).toBe("approved");
    expect(approved.reviewer).toBe("editor-1");
    expect(approved.reviewNotes).toBe("matches curated entry");
    expect(approved.payload).toMatchObject({ origin: "community", status: "approved" });
  });

  it("rejects repeated decisions after a terminal review", async () => {
    const workflow = new CommunityReviewWorkflow(authorizedReviewer);
    await workflow.submit(makeSubmission("s7"));
    await workflow.review("s7", "approved", "editor-1");
    await expect(workflow.review("s7", "rejected", "editor-2")).rejects.toThrow(/already approved/);
  });

  it("rejects duplicate ids, unknown submissions, and non-pending submissions", async () => {
    const workflow = new CommunityReviewWorkflow(authorizedReviewer);
    await workflow.submit(makeSubmission("s8"));
    await expect(workflow.submit(makeSubmission("s8"))).rejects.toThrow();
    await expect(workflow.review("nope", "approved", "editor-1")).rejects.toThrow();
    const alreadyReviewed = makeSubmission("s9");
    alreadyReviewed.status = "approved";
    await expect(workflow.submit(alreadyReviewed)).rejects.toThrow(/start as pending/);
  });
});
