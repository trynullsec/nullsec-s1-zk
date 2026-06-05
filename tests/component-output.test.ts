import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";

describe("component output and alias rules", () => {
  it("catches unconstrained component outputs", () => {
    const issues = analyzeSource(`template T() {
  signal input a;
  signal output out;
  component h = Poseidon(1);
  h.inputs[0] <== a;
  out <-- h.out;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-009")).toBe(true);
  });

  it("catches suspicious wide Num2Bits", () => {
    const issues = analyzeSource(`template T() {
  signal input value;
  component bits = Num2Bits(254);
  bits.in <== value;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-010")).toBe(true);
  });

  it("catches selector without booleanity", () => {
    const issues = analyzeSource(`template T() {
  signal input pathIndex;
  signal input left;
  signal input right;
  signal output out;
  out <== pathIndex * left + (1 - pathIndex) * right;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-012")).toBe(true);
  });
});
