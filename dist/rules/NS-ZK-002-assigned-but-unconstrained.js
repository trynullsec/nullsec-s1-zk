import { buildIssue } from "../core/issue-builder.js";
export const assignedButUnconstrainedRule = {
    id: "NS-ZK-002",
    title: "Assigned but unconstrained signal",
    description: "Detects signals assigned with <-- that are not constrained with === or <==.",
    defaultSeverity: "CRITICAL",
    tags: ["circom", "underconstraint", "soundness"],
    analyze(context) {
        return context.graph.onlyAssignedButNeverConstrained().map((assignment) => buildIssue({
            ruleId: "NS-ZK-002",
            title: "Assigned but unconstrained signal",
            severity: "CRITICAL",
            location: assignment,
            signalName: assignment.lhs,
            explanation: `The signal \`${assignment.lhs}\` is assigned with <--, which does not create a constraint. The signal was not later constrained with === or <==.`,
            impact: "A malicious prover may choose arbitrary witness values while still satisfying the circuit.",
            suggestedFix: `Use <== when possible, or add an explicit constraint such as \`${assignment.lhs} === ${assignment.rhs}\`.`,
            tags: assignedButUnconstrainedRule.tags
        }));
    }
};
//# sourceMappingURL=NS-ZK-002-assigned-but-unconstrained.js.map