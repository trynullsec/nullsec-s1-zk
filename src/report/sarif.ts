import type { AuditResult } from "../types.js";
import { allRules } from "../rules/index.js";

export function renderSarifReport(result: AuditResult): string {
  const sarif = {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: result.tool.name,
            version: result.tool.version,
            informationUri: "https://nullsec.dev/s1-zk",
            rules: allRules.map((rule) => ({
              id: rule.id,
              name: rule.title,
              shortDescription: { text: rule.title },
              fullDescription: { text: rule.description },
              defaultConfiguration: { level: rule.defaultSeverity === "CRITICAL" || rule.defaultSeverity === "HIGH" ? "error" : "warning" },
              properties: { tags: rule.tags }
            }))
          }
        },
        results: result.issues.map((issue) => ({
          ruleId: issue.ruleId,
          level: issue.severity === "CRITICAL" || issue.severity === "HIGH" ? "error" : issue.severity === "INFO" ? "note" : "warning",
          message: { text: `${issue.title}: ${issue.explanation}` },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: issue.file },
                region: {
                  startLine: issue.line,
                  startColumn: issue.column ?? 1,
                  snippet: { text: issue.snippet ?? "" }
                }
              }
            }
          ],
          properties: {
            severity: issue.severity,
            confidence: issue.confidence,
            impact: issue.impact,
            suggestedFix: issue.suggestedFix,
            tags: issue.tags
          }
        }))
      }
    ]
  };
  return `${JSON.stringify(sarif, null, 2)}\n`;
}
