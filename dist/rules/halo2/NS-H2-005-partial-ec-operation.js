import { buildIssue } from "../../core/issue-builder.js";
import { unconstrainedEcAssignments } from "../../frontends/halo2/halo2-dataflow.js";
import { isEcLikeName } from "../../frontends/halo2/halo2-patterns.js";
import { halo2Graph, hasHalo2 } from "./halo2-rule-utils.js";
export const halo2PartialEcOperationRule = {
    id: "NS-H2-005",
    title: "Partial elliptic-curve operation risk",
    description: "Detects EC-related Halo2 assignments that do not appear connected to gates or equality constraints.",
    defaultSeverity: "HIGH",
    tags: ["halo2", "ecc", "orchard", "underconstraint"],
    analyze(context) {
        if (!hasHalo2(context))
            return [];
        const graph = halo2Graph(context);
        if (!graph)
            return [];
        return unconstrainedEcAssignments(graph)
            .filter((flow) => isEcLikeName(`${flow.assignment.expression} ${flow.assignment.target ?? ""}`))
            .map((flow) => {
            const assignment = flow.assignment;
            const node = graph.assignmentNode(assignment);
            return buildIssue({
                ruleId: "NS-H2-005",
                title: "Partial elliptic-curve operation risk",
                severity: "HIGH",
                confidence: /base|scalar|point|accumulator|output|x|y/i.test(`${assignment.label ?? ""} ${assignment.assignedVariable ?? ""}`) ? "HIGH" : "MEDIUM",
                location: assignment,
                signalName: assignment.label ?? assignment.columnName ?? assignment.target,
                explanation: `The assigned advice value \`${assignment.label ?? assignment.columnName ?? "unknown"}\` appears in an elliptic-curve-related region but was not connected to any gate expression, equality constraint, lookup, copy edge, or public instance binding. This may indicate a partially constrained EC gadget.`,
                impact: "Partial elliptic-curve operations can be soundness-critical. Unconstrained coordinates, scalars, or intermediate points may allow invalid curve arithmetic witnesses.",
                suggestedFix: "Ensure every EC intermediate is bound by complete gate constraints, lookups, or equality constraints for the intended group law.",
                tags: halo2PartialEcOperationRule.tags,
                metadata: {
                    regionName: node?.region?.name,
                    columnName: node?.columnName,
                    connectedBy: flow.connections,
                    unconnectedValue: assignment.label ?? assignment.assignedVariable ?? assignment.columnName
                }
            });
        });
    }
};
//# sourceMappingURL=NS-H2-005-partial-ec-operation.js.map