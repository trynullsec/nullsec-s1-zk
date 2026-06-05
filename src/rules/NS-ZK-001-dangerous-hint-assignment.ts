import type { Rule } from "../types.js";
import { buildIssue } from "../core/issue-builder.js";

export const dangerousHintAssignmentRule: Rule = {
  id: "NS-ZK-001",
  title: "Dangerous hint assignment",
  description: "Detects Circom <-- assignments, which assign witness values without creating constraints.",
  defaultSeverity: "CRITICAL",
  tags: ["circom", "hints", "underconstraint"],
  analyze(context) {
    return context.graph.assignedByHint().map((assignment) => {
      const constrained = context.graph.appearsInAnyConstraint(assignment.lhs);
      return buildIssue({
        ruleId: "NS-ZK-001",
        title: "Dangerous hint assignment",
        severity: constrained ? "MEDIUM" : "CRITICAL",
        confidence: constrained ? "MEDIUM" : "HIGH",
        location: assignment,
        signalName: assignment.lhs,
        explanation: `The signal \`${assignment.lhs}\` is assigned with <-- from \`${assignment.rhs}\`. In Circom, <-- computes a witness value but does not create a constraint.${constrained ? " The signal appears in a later constraint, so the immediate risk is lower but should still be reviewed." : " The signal was not later constrained with === or <==."}`,
        impact: "A malicious prover may choose arbitrary witness values unless the assignment is independently constrained.",
        suggestedFix: `Prefer <== when possible, or add an explicit equality constraint such as \`${assignment.lhs} === ${assignment.rhs}\`.`,
        tags: dangerousHintAssignmentRule.tags,
        metadata: { rhs: assignment.rhs, constrained }
      });
    });
  }
};
