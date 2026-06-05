import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("NS-ZK-005", () => {
  it("catches missing booleanity", () => {
    const issues = analyzeSource(`template T() {
  signal input isAdmin;
  signal output out;
  out <== isAdmin * 10;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-005")).toBe(true);
  });

  it("does not flag safe booleanity", () => {
    const issues = analyzeSource(`template T() {
  signal input isAdmin;
  signal output out;
  isAdmin * (isAdmin - 1) === 0;
  out <== isAdmin;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-005")).toBe(false);
  });
});
