import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("NS-ZK-006", () => {
  it("catches missing range checks", () => {
    const issues = analyzeSource(`template T() {
  signal input amount;
  signal output out;
  out <== amount + 1;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-006" && issue.signalName === "amount")).toBe(true);
  });

  it("does not flag Num2Bits usage", () => {
    const issues = analyzeSource(`template T() {
  signal input amount;
  signal output out;
  component bits = Num2Bits(64);
  bits.in <== amount;
  out <== amount;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-006" && issue.signalName === "amount")).toBe(false);
  });
});
