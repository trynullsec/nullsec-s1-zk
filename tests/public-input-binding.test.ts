import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("NS-ZK-003", () => {
  it("catches unbound inputs", () => {
    const issues = analyzeSource(`template T() {
  signal input root;
  signal output out;
  out <== 1;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-003" && issue.signalName === "root")).toBe(true);
  });
});
