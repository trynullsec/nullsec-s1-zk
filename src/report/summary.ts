import type { AuditSummary, Issue } from "../types.js";

export function summarizeIssues(issues: Issue[]): AuditSummary {
  return issues.reduce<AuditSummary>(
    (summary, issue) => {
      summary[issue.severity] += 1;
      return summary;
    },
    { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  );
}
