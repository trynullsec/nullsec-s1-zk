import { describe, expect, it } from "vitest";
import { scanTarget } from "../src/scanner.js";

describe("Orchard-inspired Halo2 benchmark", () => {
  it("flags the synthetic partial EC multiplication gadget", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired/vulnerable-ec-mul.rs", { format: "json", failOn: "CRITICAL" });
    const ecIssues = run.result.issues.filter((issue) => issue.ruleId === "NS-H2-005");
    expect(run.result.frontend).toBe("Halo2");
    expect(ecIssues.length).toBeGreaterThan(0);
    expect(ecIssues.some((issue) => /base point y/i.test(`${issue.signalName} ${issue.explanation}`))).toBe(true);
  });

  it("generates an exploit hypothesis for the vulnerable EC multiplication gadget", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired/vulnerable-ec-mul.rs", { format: "json", deep: true });
    expect(run.result.deepAnalysis?.exploitHypotheses.length).toBeGreaterThan(0);
    expect(run.result.deepAnalysis?.exploitHypotheses.some((hypothesis) => hypothesis.hypothesis.includes("scalar multiplication"))).toBe(true);
  });

  it("does not flag the safe synthetic EC multiplication gadget as CRITICAL", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired/fixed-ec-mul.rs", { format: "json", failOn: "CRITICAL" });
    expect(run.result.frontend).toBe("Halo2");
    expect(run.result.issues.filter((issue) => issue.severity === "CRITICAL")).toHaveLength(0);
  });

  it("does not report HIGH NS-H2-005 findings for the fixed EC multiplication gadget", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired/fixed-ec-mul.rs", { format: "json" });
    expect(run.result.issues.filter((issue) => issue.ruleId === "NS-H2-005" && issue.severity === "HIGH")).toHaveLength(0);
  });
});
