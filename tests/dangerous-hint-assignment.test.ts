import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("NS-ZK-001", () => {
  it("detects all hint assignments and lowers severity when constrained", () => {
    const issues = analyzeSource(`template T() {
  signal input a;
  signal output x;
  x <-- a;
  x === a;
}`);
    const issue = issues.find((candidate) => candidate.ruleId === "NS-ZK-001");
    expect(issue?.severity).toBe("MEDIUM");
  });
});
