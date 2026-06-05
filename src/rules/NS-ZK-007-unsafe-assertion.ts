import type { Rule } from "../types.js";
import { buildIssue } from "../core/issue-builder.js";

export const unsafeAssertionRule: Rule = {
  id: "NS-ZK-007",
  title: "Unsafe assertion over signals",
  description: "Detects assert(...) expressions involving circuit signals.",
  defaultSeverity: "HIGH",
  tags: ["assert", "circom", "constraints"],
  analyze(context) {
    return context.ir.assertions
      .filter((assertion) => assertion.referencedSignals.length > 0)
      .map((assertion) =>
        buildIssue({
          ruleId: "NS-ZK-007",
          title: "Unsafe assertion over signals",
          severity: "HIGH",
          location: assertion,
          signalName: assertion.referencedSignals[0],
          explanation: `The assertion \`assert(${assertion.expression})\` references circuit signals. Circom assertions are not a substitute for proof constraints.`,
          impact: "A circuit may rely on a condition that is not actually enforced in the constraint system.",
          suggestedFix: "Replace signal assertions with constraints using === or equivalent constraint gadgets.",
          tags: unsafeAssertionRule.tags
        })
      );
  }
};
