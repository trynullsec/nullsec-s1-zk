import { describe, expect, it } from "vitest";
import { scanTarget } from "../src/scanner.js";

describe("Halo2 rules", () => {
  it("vulnerable Halo2 examples produce Halo2 findings", async () => {
    const run = await scanTarget("./examples/halo2/vulnerable", { format: "json", failOn: "CRITICAL" });
    const ruleIds = new Set(run.result.issues.map((issue) => issue.ruleId));
    expect(run.result.frontend).toBe("Halo2");
    expect(ruleIds.has("NS-H2-001")).toBe(true);
    expect(ruleIds.has("NS-H2-002")).toBe(true);
    expect(ruleIds.has("NS-H2-003")).toBe(true);
    expect(ruleIds.has("NS-H2-004")).toBe(true);
    expect(ruleIds.has("NS-H2-005")).toBe(true);
  });

  it("safe Halo2 examples produce no CRITICAL findings", async () => {
    const run = await scanTarget("./examples/halo2/safe", { format: "json", failOn: "CRITICAL" });
    expect(run.result.frontend).toBe("Halo2");
    expect(run.result.issues.filter((issue) => issue.severity === "CRITICAL")).toHaveLength(0);
  });

  it("mixed examples report Mixed frontend", async () => {
    const run = await scanTarget("./examples", { format: "json", failOn: "CRITICAL" });
    expect(run.result.frontend).toBe("Mixed");
  });
});
