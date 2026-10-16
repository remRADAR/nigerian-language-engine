import { describe, it, expect } from "vitest";
import { CommunityReviewWorkflow } from "../src/submissions.js";
import type { CommunitySubmission } from "../src/types.js";

const makeSubmission = (id: string): CommunitySubmission => ({
  id,
  languageId: "yor",
  kind: "dictionary",
  payload: { id: `entry-${id}`, languageId: "yor", term: "àbúrò", meanings: ["younger sibling"], origin: "community", status: "approved", sources: ["submitter"] },
  submittedBy: "user-1",
  submittedAt: new Date().toISOString(),
  status: "pending",
});

describe("CommunityReviewWorkflow", () => {
  it("keeps submissions pending until reviewed", async () => {
    const wf = new CommunityReviewWorkflow();
    const s = await wf.submit(makeSubmission("s1"));
    expect(s.status).toBe("pending");
    expect(wf.pending()).toHaveLength(1);
  });

  it("requires reviewer identity for a decision", async () => {
    const wf = new CommunityReviewWorkflow();
    await wf.submit(makeSubmission("s2"));
    await expect(wf.review("s2", "approved", "")).rejects.toThrow();
    await expect(wf.review("s2", "approved", "   ")).rejects.toThrow();
  });

  it("records the reviewer and notes on approval", async () => {
    const wf = new CommunityReviewWorkflow();
    await wf.submit(makeSubmission("s3"));
    const approved = await wf.review("s3", "approved", "editor-1", "matches curated entry");
    expect(approved.status).toBe("approved");
    expect(approved.reviewer).toBe("editor-1");
    expect(approved.reviewNotes).toBe("matches curated entry");
  });

  it("rejects duplicate ids and unknown submissions", async () => {
    const wf = new CommunityReviewWorkflow();
    await wf.submit(makeSubmission("s4"));
    await expect(wf.submit(makeSubmission("s4"))).rejects.toThrow();
    await expect(wf.review("nope", "approved", "editor")).rejects.toThrow();
  });

  it("rejects submissions that do not start pending", async () => {
    const wf = new CommunityReviewWorkflow();
    const s = makeSubmission("s5");
    s.status = "approved";
    await expect(wf.submit(s)).rejects.toThrow();
  });
});
