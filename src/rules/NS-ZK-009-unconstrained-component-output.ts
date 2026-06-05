import type { Rule } from "../types.js";
import { buildIssue } from "../core/issue-builder.js";

export const unconstrainedComponentOutputRule: Rule = {
  id: "NS-ZK-009",
  title: "Unconstrained component output",
  description: "Detects component outputs copied through unsafe hint assignments.",
  defaultSeverity: "CRITICAL",
  tags: ["components", "outputs", "underconstraint"],
  analyze(context) {
    return context.graph
      .assignedByHint()
      .filter((assignment) => assignment.referencedSignals.some((ref) => context.graph.isComponentOutputReference(ref)) && !context.graph.appearsInAnyConstraint(assignment.lhs))
      .map((assignment) =>
        buildIssue({
          ruleId: "NS-ZK-009",
          title: "Unconstrained component output",
          severity: "CRITICAL",
          location: assignment,
          signalName: assignment.lhs,
          explanation: `The signal \`${assignment.lhs}\` is assigned from component output \`${assignment.rhs}\` using <-- and is not constrained afterward.`,
          impact: "Component outputs must be bound into the constraint system. Otherwise the witness can choose arbitrary downstream values.",
          suggestedFix: `Use \`${assignment.lhs} <== ${assignment.rhs}\` or add \`${assignment.lhs} === ${assignment.rhs}\`.`,
          tags: unconstrainedComponentOutputRule.tags
        })
      );
  }
};
