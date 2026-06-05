import type { Rule } from "../types.js";
import { buildIssue } from "../core/issue-builder.js";
import { isSelectorLikeName } from "../frontends/circom/circom-utils.js";

function looksLikeMux(snippet: string | undefined, signalName: string): boolean {
  if (!snippet) return false;
  const lower = snippet.toLowerCase();
  return lower.includes(signalName.toLowerCase()) && (lower.includes("(1-") || lower.includes("1 -") || lower.includes("?") || lower.includes("*"));
}

export const suspiciousSelectorRule: Rule = {
  id: "NS-ZK-012",
  title: "Suspicious selector without booleanity",
  description: "Detects selector-like signals used in conditional formulas without booleanity constraints.",
  defaultSeverity: "HIGH",
  tags: ["selectors", "booleanity", "branching"],
  analyze(context) {
    return context.ir.signals
      .filter((signal) => isSelectorLikeName(signal.baseName))
      .filter((signal) => !context.graph.hasBooleanityConstraint(signal.name))
      .filter((signal) => context.graph.signalReferences(signal.name).some((ref) => looksLikeMux(ref.snippet, signal.baseName)))
      .map((signal) =>
        buildIssue({
          ruleId: "NS-ZK-012",
          title: "Suspicious selector without booleanity",
          severity: "HIGH",
          location: signal,
          signalName: signal.name,
          explanation: `The selector-like signal \`${signal.name}\` appears in conditional or multiplexer-style arithmetic without a booleanity constraint.`,
          impact: "Selectors must usually be boolean. If not constrained to 0/1, a prover can create invalid linear combinations or bypass branches.",
          suggestedFix: `Add \`${signal.name} * (${signal.name} - 1) === 0;\` or use a vetted selector gadget.`,
          tags: suspiciousSelectorRule.tags
        })
      );
  }
};
