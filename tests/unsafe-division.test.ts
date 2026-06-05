import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("NS-ZK-008", () => {
  it("catches unsafe division", () => {
    const issues = analyzeSource(`template T() {
  signal input a;
  signal input b;
  signal output q;
  q <-- a / b;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-008")).toBe(true);
  });
});
