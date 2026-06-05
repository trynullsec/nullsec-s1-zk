import { buildCircuitIR } from "../frontends/circom/circom-ir-builder.js";
import { ConstraintGraph } from "../ir/constraint-graph.js";
import { allRules } from "../rules/index.js";
import { summarizeIssues } from "../report/summary.js";
import { RuleEngine } from "./rule-engine.js";
export function auditParsedFiles(target, parsedFiles, config) {
    const ir = buildCircuitIR(parsedFiles);
    const graph = new ConstraintGraph(ir);
    const engine = new RuleEngine(allRules);
    const { issues, rulesExecuted } = engine.run({ target, ir, graph, config });
    return {
        tool: { name: "Nullsec S1-ZK", version: "1.0.0" },
        target,
        frontend: "Circom",
        filesScanned: parsedFiles.length,
        rulesExecuted,
        summary: summarizeIssues(issues),
        issues,
        parserWarnings: ir.parserWarnings
    };
}
//# sourceMappingURL=audit-engine.js.map