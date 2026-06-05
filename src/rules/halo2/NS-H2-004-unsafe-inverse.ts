import { buildIssue } from "../../core/issue-builder.js";
import type { Issue, Rule } from "../../types.js";
import { fileHasSafeInverseGuard, hasHalo2 } from "./halo2-rule-utils.js";

export const halo2UnsafeInverseRule: Rule = {
  id: "NS-H2-004",
  title: "Unsafe inverse or division",
  description: "Detects Halo2 Rust inverse/division patterns without an obvious nonzero guard nearby.",
  defaultSeverity: "HIGH",
  tags: ["halo2", "inverse", "division", "nonzero"],
  analyze(context) {
    if (!hasHalo2(context)) return [];
    const issues: Issue[] = [];
    for (const file of context.halo2?.files ?? []) {
      const lines = file.rawSource.split(/\r?\n/);
      lines.forEach((lineText, index) => {
        if (!/\.invert\s*\(|\.inverse\s*\(|\binvert\s*\(|\binverse\s*\(|\s\/\s/.test(lineText)) return;
        const location = {
          file: file.filePath,
          line: index + 1,
          column: Math.max(1, lineText.search(/invert|inverse|\//) + 1),
          snippet: lineText.trim()
        };
        const guarded = fileHasSafeInverseGuard(file.filePath, index + 1, context);
        issues.push(
          buildIssue({
            ruleId: "NS-H2-004",
            title: "Unsafe inverse or division",
            severity: guarded ? "INFO" : "HIGH",
            confidence: guarded ? "LOW" : "MEDIUM",
            location,
            explanation: guarded
              ? "This Halo2 Rust code computes an inverse or division near an apparent nonzero guard or inverse relation. Review the guard to ensure both zero and nonzero branches are constrained."
              : "This Halo2 Rust code computes an inverse or division without an obvious nearby nonzero check or safe inversion gadget.",
            impact: "Inversion requires explicit zero handling. Missing guards can leave edge cases underconstrained or incorrectly assigned.",
            suggestedFix: "Add an explicit nonzero constraint, use a vetted IsZero/safe inversion gadget, and constrain both branches.",
            tags: halo2UnsafeInverseRule.tags
          })
        );
      });
    }
    return issues;
  }
};
