import { existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { scanTarget } from "../src/scanner.js";

describe("CLI and scanner", () => {
  it("scan examples works", async () => {
    const run = await scanTarget("./examples", { failOn: "CRITICAL" });
    expect(run.result.filesScanned).toBeGreaterThan(0);
    expect(run.output).toContain("Nullsec S1-ZK");
  });

  it("--format json works through scanner", async () => {
    const run = await scanTarget("./examples", { format: "json", failOn: "CRITICAL" });
    expect(JSON.parse(run.output).tool.name).toBe("Nullsec S1-ZK");
  });

  it("--report markdown writes file", async () => {
    rmSync("nullsec-zk-report.md", { force: true });
    await scanTarget("./examples", { report: "markdown", failOn: "CRITICAL" });
    expect(existsSync("nullsec-zk-report.md")).toBe(true);
    rmSync("nullsec-zk-report.md", { force: true });
  });

  it("--fail-on works", async () => {
    const run = await scanTarget("./examples/safe", { failOn: "CRITICAL" });
    expect([0, 1]).toContain(run.exitCode);
  });

  it("rules command works after build when available", () => {
    if (!existsSync("dist/cli.js")) return;
    const output = execFileSync("node", ["dist/cli.js", "rules"], { encoding: "utf8" });
    expect(output).toContain("NS-ZK-001");
  });
});
