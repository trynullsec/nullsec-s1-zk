import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("NS-ZK-004", () => {
  it("catches unconstrained outputs", () => {
    const issues = analyzeSource(`template T() {
  signal input a;
  signal output out;
  out <-- a;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-004" && issue.signalName === "out")).toBe(true);
  });
});
