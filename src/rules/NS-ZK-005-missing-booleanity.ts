import type { Rule } from "../types.js";
import { buildIssue } from "../core/issue-builder.js";
import { isBooleanLikeName } from "../frontends/circom/circom-utils.js";

export const missingBooleanityRule: Rule = {
  id: "NS-ZK-005",
  title: "Missing booleanity constraint",
  description: "Detects boolean-like signals that are not constrained to 0 or 1.",
  defaultSeverity: "HIGH",
  tags: ["booleanity", "selectors", "authorization"],
  analyze(context) {
    return context.graph
      .declaredSignals()
      .filter((signal) => isBooleanLikeName(signal.baseName) && context.graph.signalReferences(signal.name).length > 0 && !context.graph.hasBooleanityConstraint(signal.name))
      .map((signal) =>
        buildIssue({
          ruleId: "NS-ZK-005",
          title: "Missing booleanity constraint",
          severity: "HIGH",
          location: signal,
          signalName: signal.name,
          explanation: `The signal \`${signal.name}\` looks boolean or selector-like, but no x * (x - 1) === 0 style constraint was found.`,
          impact: "A prover may use arbitrary field values instead of 0 or 1, breaking selector logic, path selection, authorization checks, or branching constraints.",
          suggestedFix: `Add a booleanity constraint: \`${signal.name} * (${signal.name} - 1) === 0;\`.`,
          tags: missingBooleanityRule.tags
        })
      );
  }
};
