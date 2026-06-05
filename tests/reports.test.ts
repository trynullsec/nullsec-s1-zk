import { describe, expect, it } from "vitest";
import { auditParsedFiles } from "../src/core/audit-engine.js";
import { defaultConfig } from "../src/config.js";
import { parseSource } from "./helpers.js";
import { renderTerminalReport } from "../src/report/terminal.js";
import { renderJsonReport } from "../src/report/json.js";
import { renderMarkdownReport } from "../src/report/markdown.js";
import { renderSarifReport } from "../src/report/sarif.js";

describe("reports", () => {
  const result = auditParsedFiles("test", [parseSource(`template T() {
  signal input a;
  signal output out;
  out <-- a;
}`)], defaultConfig);

  it("renders terminal output", () => {
    expect(renderTerminalReport(result)).toContain("Nullsec S1-ZK");
  });

  it("renders stable json shape", () => {
    const json = JSON.parse(renderJsonReport(result));
    expect(json.tool.name).toBe("Nullsec S1-ZK");
    expect(Array.isArray(json.issues)).toBe(true);
  });

  it("renders markdown with issues", () => {
    expect(renderMarkdownReport(result)).toContain("# Nullsec S1-ZK Report");
    expect(renderMarkdownReport(result)).toContain("NS-ZK-002");
  });

  it("renders structurally valid SARIF", () => {
    const sarif = JSON.parse(renderSarifReport(result));
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0].results.length).toBeGreaterThan(0);
  });
});
