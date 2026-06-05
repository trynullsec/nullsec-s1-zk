import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("NS-ZK-002", () => {
  it("catches unconstrained hint assignments", () => {
    const issues = analyzeSource(`template T() {
  signal input a;
  signal output x;
  x <-- a;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-002" && issue.severity === "CRITICAL")).toBe(true);
  });
});
