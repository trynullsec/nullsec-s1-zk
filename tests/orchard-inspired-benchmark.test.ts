import { describe, expect, it } from "vitest";
import { scanTarget } from "../src/scanner.js";

describe("Orchard-inspired Halo2 benchmark", () => {
  it("flags the synthetic partial EC multiplication gadget", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired/partial-ec-mul-halo2.rs", { format: "json", failOn: "CRITICAL" });
    const ecIssues = run.result.issues.filter((issue) => issue.ruleId === "NS-H2-005");
    expect(run.result.frontend).toBe("Halo2");
    expect(ecIssues.length).toBeGreaterThan(0);
    expect(ecIssues.some((issue) => /base y/i.test(`${issue.signalName} ${issue.explanation}`))).toBe(true);
  });

  it("does not flag the safe synthetic EC multiplication gadget as CRITICAL", async () => {
    const run = await scanTarget("./benchmarks/historical/orchard-inspired/safe-ec-mul-halo2.rs", { format: "json", failOn: "CRITICAL" });
    expect(run.result.frontend).toBe("Halo2");
    expect(run.result.issues.filter((issue) => issue.severity === "CRITICAL")).toHaveLength(0);
  });
});
