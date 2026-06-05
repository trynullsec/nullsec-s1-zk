import { buildIssue } from "../core/issue-builder.js";
export const unconstrainedOutputRule = {
    id: "NS-ZK-004",
    title: "Unconstrained output",
    description: "Detects output signals that are assigned unsafely or do not participate in constraints.",
    defaultSeverity: "HIGH",
    tags: ["outputs", "underconstraint"],
    analyze(context) {
        return context.graph.unconstrainedOutputs().map((signal) => {
            const hintAssignment = context.graph.assignmentsForSignal(signal.name).find((assignment) => assignment.operator === "<--");
            return buildIssue({
                ruleId: "NS-ZK-004",
                title: "Unconstrained output",
                severity: hintAssignment ? "CRITICAL" : "HIGH",
                location: hintAssignment ?? signal,
                signalName: signal.name,
                explanation: hintAssignment
                    ? `The output \`${signal.name}\` is assigned with <-- and is not safely bound as an output constraint.`
                    : `The output \`${signal.name}\` does not appear in any parsed constraint.`,
                impact: "The circuit may output a value that was not proven to be correctly derived.",
                suggestedFix: "Constrain outputs with <== or an explicit === relation to the intended expression.",
                tags: unconstrainedOutputRule.tags
            });
        });
    }
};
//# sourceMappingURL=NS-ZK-004-unconstrained-output.js.map