import { buildIssue } from "../../core/issue-builder.js";
import type { Rule } from "../../types.js";
import { halo2Graph, hasHalo2 } from "./halo2-rule-utils.js";

export const halo2InstanceNotBoundRule: Rule = {
  id: "NS-H2-002",
  title: "Instance value not bound",
  description: "Detects Halo2 instance/public values that are queried without an obvious constrain_instance binding.",
  defaultSeverity: "HIGH",
  tags: ["halo2", "instance", "public-input"],
  analyze(context) {
    if (!hasHalo2(context)) return [];
    const graph = halo2Graph(context);
    if (!graph) return [];
    return (context.halo2?.queries ?? [])
      .filter((query) => query.queryType === "instance")
      .filter((query) => !graph.instanceQueryIsBound(query.columnName, query.file))
      .map((query) =>
        buildIssue({
          ruleId: "NS-H2-002",
          title: "Instance value not bound",
          severity: "HIGH",
          confidence: "MEDIUM",
          location: query,
          signalName: query.columnName,
          explanation: `The instance column/value \`${query.columnName}\` is queried but no matching constrain_instance binding was found in this file.`,
          impact: "The circuit may read a public instance value without binding an assigned cell to the public statement.",
          suggestedFix: "Use layouter.constrain_instance or an equivalent public input binding for the intended cell and instance row.",
          tags: halo2InstanceNotBoundRule.tags
        })
      );
  }
};
