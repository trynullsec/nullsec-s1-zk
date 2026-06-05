import type { AuditContext, Issue, Rule, Severity } from "../types.js";
import { compareSeverity, normalizeSeverity } from "./severity.js";
import { resetIssueCounter } from "./issue-builder.js";

function configuredSeverity(ruleId: string, configValue: string | undefined, fallback: Severity): Severity {
  return normalizeSeverity(configValue, fallback);
}

export class RuleEngine {
  constructor(private readonly rules: Rule[]) {}

  run(context: AuditContext): { issues: Issue[]; rulesExecuted: number } {
    resetIssueCounter();
    const issues: Issue[] = [];
    let rulesExecuted = 0;

    for (const rule of this.rules) {
      const setting = context.config.rules[rule.id] ?? context.config.rules[rule.id.replace(/-.*/, "")];
      if (String(setting).toLowerCase() === "off") continue;
      rulesExecuted += 1;
      const ruleIssues = rule.analyze(context).map((issue) => ({
        ...issue,
        severity: configuredSeverity(rule.id, typeof setting === "string" ? setting : undefined, issue.severity)
      }));
      issues.push(...ruleIssues);
    }

    return { issues: this.sortAndDeduplicate(issues), rulesExecuted };
  }

  private sortAndDeduplicate(issues: Issue[]): Issue[] {
    const seen = new Set<string>();
    const deduped: Issue[] = [];
    for (const issue of issues) {
      const key = `${issue.ruleId}:${issue.file}:${issue.line}:${issue.signalName ?? ""}:${issue.snippet ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(issue);
    }
    return deduped.sort((a, b) => compareSeverity(a.severity, b.severity) || a.file.localeCompare(b.file) || a.line - b.line);
  }
}
