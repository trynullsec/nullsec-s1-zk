import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractProofObligations } from "../src/analysis/proof-obligation-extractor.js";
import { checkProofObligations } from "../src/analysis/relation-checker.js";
import { analyzeTaintFlow } from "../src/analysis/taint-flow.js";
import { circomContext, halo2Context } from "./analysis-helpers.js";

describe("relation checker", () => {
  it("detects missing selector booleanity relation", () => {
    const context = circomContext(`template T() {
  signal input pathIndex;
  signal output out;
  out <== pathIndex;
}`);
    const obligations = extractProofObligations(context);
    const checks = checkProofObligations(context, obligations);
    expect(checks.some((check) => check.status === "missing" && check.missing.includes("pathIndex"))).toBe(true);
  });

  it("detects partially satisfied EC multiplication relations", () => {
    const source = readFileSync("./benchmarks/historical/orchard-inspired/vulnerable-ec-mul.rs", "utf8");
    const context = halo2Context(source, "vulnerable-ec-mul.rs");
    const obligations = extractProofObligations(context);
    const checks = checkProofObligations(context, obligations, analyzeTaintFlow(context));
    expect(checks.some((check) => (check.status === "partially_satisfied" || check.status === "missing") && check.explanation.includes("EC multiplication"))).toBe(true);
  });
});
