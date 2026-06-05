import { buildIssue } from "../../core/issue-builder.js";
import { halo2Graph, hasHalo2 } from "./halo2-rule-utils.js";
export const halo2AssignedAdviceNotConstrainedRule = {
    id: "NS-H2-001",
    title: "Assigned advice not constrained",
    description: "Detects Halo2 advice assignments that do not appear connected to gates, equality constraints, instance constraints, or lookups.",
    defaultSeverity: "HIGH",
    tags: ["halo2", "advice", "underconstraint"],
    analyze(context) {
        if (!hasHalo2(context))
            return [];
        const graph = halo2Graph(context);
        if (!graph)
            return [];
        return (context.halo2?.assignments ?? [])
            .filter((assignment) => assignment.assignmentType === "advice")
            .filter((assignment) => !graph.isAssignmentConnected(assignment))
            .map((assignment) => {
            const node = graph.assignmentNode(assignment);
            return buildIssue({
                ruleId: "NS-H2-001",
                title: "Assigned advice not constrained",
                severity: /output|commit|root|instance|public/i.test(assignment.expression) ? "CRITICAL" : "HIGH",
                confidence: "MEDIUM",
                location: assignment,
                signalName: assignment.label ?? assignment.columnName ?? assignment.target,
                explanation: `The assigned advice value \`${assignment.label ?? assignment.columnName ?? "unknown"}\` was not connected to any parsed gate expression, equality edge, copy constraint, lookup, or public instance binding.`,
                impact: "A prover-controlled advice value may be assigned in a region without being bound by the constraint system.",
                suggestedFix: "Reference the assigned cell in a gate expression, lookup, constrain_equal call, or constrain_instance call as intended.",
                tags: halo2AssignedAdviceNotConstrainedRule.tags,
                metadata: {
                    regionName: node?.region?.name,
                    columnName: node?.columnName,
                    connectedBy: []
                }
            });
        });
    }
};
//# sourceMappingURL=NS-H2-001-assigned-advice-not-constrained.js.map