import { describe, expect, it } from "vitest";
import { scanTarget } from "../src/scanner.js";

describe("deep scan", () => {
  it("normal scan still omits deep analysis", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired", { format: "json" });
    expect(run.result.deepAnalysis).toBeUndefined();
  });

  it("--deep includes proof obligation summary and exploit hypotheses", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired", { format: "json", deep: true });
    expect(run.result.deepAnalysis?.proofObligationSummary.total).toBeGreaterThan(0);
    expect(run.result.deepAnalysis?.exploitHypotheses.some((hypothesis) => hypothesis.hypothesis.includes("scalar multiplication"))).toBe(true);
    expect(run.output).toContain("proofObligationSummary");
  });

  it("terminal deep report contains proof obligation summary", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired", { deep: true });
    expect(run.output).toContain("Proof obligations:");
  });
});
