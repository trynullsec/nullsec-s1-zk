import { buildIssue } from "../core/issue-builder.js";
export const unusedSignalRule = {
    id: "NS-ZK-011",
    title: "Unused signal",
    description: "Detects declared signals that are never assigned and never constrained.",
    defaultSeverity: "LOW",
    tags: ["dead-code", "completeness"],
    analyze(context) {
        return context.ir.signals
            .filter((signal) => signal.kind !== "output")
            .filter((signal) => context.graph.assignmentsForSignal(signal.name).length === 0 && !context.graph.appearsInAnyConstraint(signal.name))
            .map((signal) => buildIssue({
            ruleId: "NS-ZK-011",
            title: "Unused signal",
            severity: "LOW",
            confidence: "MEDIUM",
            location: signal,
            signalName: signal.name,
            explanation: `The signal \`${signal.name}\` is declared but was not assigned or constrained in the parsed circuit.`,
            impact: "Unused signals may indicate incomplete constraints or dead circuit logic.",
            suggestedFix: "Remove the signal if it is dead, or add the intended assignment and constraints.",
            tags: unusedSignalRule.tags
        }));
    }
};
//# sourceMappingURL=NS-ZK-011-unused-signal.js.map