import type { Rule } from "../types.js";
import { buildIssue } from "../core/issue-builder.js";

export const unboundPublicInputRule: Rule = {
  id: "NS-ZK-003",
  title: "Unbound input signal",
  description: "Detects input signals that never appear in constraints.",
  defaultSeverity: "HIGH",
  tags: ["inputs", "public-inputs", "binding"],
  analyze(context) {
    return context.graph.unboundInputs().map((signal) =>
      buildIssue({
        ruleId: "NS-ZK-003",
        title: "Unbound input signal",
        severity: "HIGH",
        location: signal,
        signalName: signal.name,
        explanation: `The input signal \`${signal.name}\` does not appear in any parsed constraint.`,
        impact: "The proof may not bind the claimed input to the statement being proven.",
        suggestedFix: "Reference the input inside a constraint that enforces the intended relation.",
        tags: unboundPublicInputRule.tags
      })
    );
  }
};
