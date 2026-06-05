import { buildIssue } from "../../core/issue-builder.js";
import type { Rule } from "../../types.js";
import { halo2Graph, hasHalo2 } from "./halo2-rule-utils.js";

export const halo2SelectorRiskRule: Rule = {
  id: "NS-H2-003",
  title: "Selector discipline risk",
  description: "Detects selectors used in Halo2 gates without clear enable usage.",
  defaultSeverity: "MEDIUM",
  tags: ["halo2", "selector", "gates"],
  analyze(context) {
    if (!hasHalo2(context)) return [];
    const graph = halo2Graph(context);
    if (!graph) return [];
    return (context.halo2?.selectors ?? [])
      .filter((selector) => selector.usedInGates.length > 0 && !graph.selectorEnabled(selector.name))
      .filter((selector) => graph.selectorUsedAsGateMultiplier(selector.name) || /selector|enable|swap|range|mul|bool|flag|q_/i.test(selector.name))
      .map((selector) =>
        buildIssue({
          ruleId: "NS-H2-003",
          title: "Selector discipline risk",
          severity: selector.usedInGates.length > 1 ? "HIGH" : "MEDIUM",
          confidence: "MEDIUM",
          location: selector,
          signalName: selector.name,
          explanation: `Selector \`${selector.name}\` is queried in a gate and appears to gate a constraint, but no matching selector enable call was found in parsed regions.`,
          impact: "Selectors control when Halo2 gates are active. Missing or unclear selector enable discipline can disable intended constraints.",
          suggestedFix: "Ensure the selector is enabled on every row where the gate must apply and document the selector discipline.",
          tags: halo2SelectorRiskRule.tags,
          metadata: {
            involvedSelector: selector.name,
            usedInGates: selector.usedInGates,
            selectorMultiplier: graph.selectorUsedAsGateMultiplier(selector.name)
          }
        })
      );
  }
};
