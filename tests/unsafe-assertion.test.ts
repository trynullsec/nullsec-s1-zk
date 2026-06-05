import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("NS-ZK-007", () => {
  it("catches assert over signals", () => {
    const issues = analyzeSource(`template T() {
  signal input secret;
  signal input expected;
  assert(secret === expected);
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-007")).toBe(true);
  });
});
