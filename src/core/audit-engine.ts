import type { AuditResult, FrontendName, NullsecConfig, ParsedCircuitFile } from "../types.js";
import { buildCircuitIR } from "../frontends/circom/circom-ir-builder.js";
import { buildHalo2IR } from "../frontends/halo2/halo2-ir-builder.js";
import type { Halo2CircuitFile } from "../frontends/halo2/halo2-types.js";
import { ConstraintGraph } from "../ir/constraint-graph.js";
import { runDeepAnalysis } from "../analysis/deep-analysis.js";
import { allRules } from "../rules/index.js";
import { summarizeIssues } from "../report/summary.js";
import { VERSION } from "../version.js";
import { RuleEngine } from "./rule-engine.js";

function frontendName(circomCount: number, halo2Count: number): FrontendName {
  if (circomCount > 0 && halo2Count > 0) return "Mixed";
  if (halo2Count > 0) return "Halo2";
  return "Circom";
}

export function auditParsedFiles(target: string, parsedFiles: ParsedCircuitFile[], config: NullsecConfig, halo2Files: Halo2CircuitFile[] = [], deep = false): AuditResult {
  const ir = buildCircuitIR(parsedFiles);
  const halo2 = buildHalo2IR(halo2Files);
  const graph = new ConstraintGraph(ir);
  const engine = new RuleEngine(allRules);
  const context = { target, ir, graph, config, halo2 };
  const { issues, rulesExecuted } = engine.run(context);
  return {
    tool: { name: "Nullsec S1-ZK", version: VERSION },
    target,
    frontend: frontendName(parsedFiles.length, halo2Files.length),
    filesScanned: parsedFiles.length + halo2Files.length,
    rulesExecuted,
    summary: summarizeIssues(issues),
    issues,
    parserWarnings: [...ir.parserWarnings, ...halo2.parserWarnings],
    deepAnalysis: deep ? runDeepAnalysis(context, issues) : undefined
  };
}
