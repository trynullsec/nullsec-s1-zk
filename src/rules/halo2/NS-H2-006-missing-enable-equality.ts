import { buildIssue } from "../../core/issue-builder.js";
import type { Rule } from "../../types.js";
import { halo2Graph, hasHalo2 } from "./halo2-rule-utils.js";

export const halo2MissingEnableEqualityRule: Rule = {
  id: "NS-H2-006",
  title: "Missing enable_equality for copy constraints",
  description: "Detects constrain_equal/copy-like usage on columns without an obvious enable_equality call.",
  defaultSeverity: "MEDIUM",
  tags: ["halo2", "equality", "copy-constraints"],
  analyze(context) {
    if (!hasHalo2(context)) return [];
    const graph = halo2Graph(context);
    if (!graph) return [];
    return (context.halo2?.equalityConstraints ?? [])
      .filter((constraint) => !graph.equalityConstraintHasEnabledColumn(constraint.snippet))
      .map((constraint) =>
        buildIssue({
          ruleId: "NS-H2-006",
          title: "Missing enable_equality for copy constraints",
          severity: "MEDIUM",
          confidence: "MEDIUM",
          location: constraint,
          explanation: "A constrain_equal call was found, but no referenced parsed column has an obvious enable_equality call.",
          impact: "Halo2 copy constraints require equality-enabled columns. Missing enable_equality can indicate broken copy-constraint assumptions or incomplete configuration.",
          suggestedFix: "Call meta.enable_equality for every advice/instance column participating in copy constraints.",
          tags: halo2MissingEnableEqualityRule.tags,
          metadata: { referencedColumns: constraint.referencedColumns }
        })
      );
  }
};
