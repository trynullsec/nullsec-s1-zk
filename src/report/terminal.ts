import chalk from "chalk";
import type { AuditResult, Issue, Severity } from "../types.js";

const colorBySeverity: Record<Severity, (value: string) => string> = {
  CRITICAL: chalk.redBright.bold,
  HIGH: chalk.red,
  MEDIUM: chalk.yellow,
  LOW: chalk.blue,
  INFO: chalk.gray
};

function renderIssue(issue: Issue): string {
  const color = colorBySeverity[issue.severity];
  return `${color(`[${issue.severity}]`)} ${issue.ruleId} ${issue.title}
File: ${issue.file}:${issue.line}
Template: ${issue.templateName ?? "unknown"}

  ${issue.snippet ?? ""}

Why this matters:
${issue.explanation}

Impact:
${issue.impact}

Suggested fix:
${issue.suggestedFix}

Confidence:
${issue.confidence}
`;
}

function renderDeepAnalysis(result: AuditResult): string {
  const deep = result.deepAnalysis;
  if (!deep) return "";
  const summary = deep.proofObligationSummary;
  const criticalHypotheses = deep.exploitHypotheses.slice(0, 5);
  return `
Proof obligations:
Total      ${summary.total}
Satisfied  ${summary.satisfied}
Partial    ${summary.partially_satisfied}
Missing    ${summary.missing}
Unknown    ${summary.unknown}

${criticalHypotheses
  .map(
    (hypothesis) => `Exploit hypothesis for ${hypothesis.issueId}:
${hypothesis.hypothesis}
Broken assumption:
${hypothesis.brokenAssumption}
Patch direction:
${hypothesis.patchDirection}
`
  )
  .join("\n")}`;
}

export function renderTerminalReport(result: AuditResult): string {
  return `${chalk.bold("Nullsec S1-ZK")}
AI-native auditing for zero-knowledge circuits

Target: ${result.target}
Frontend: ${result.frontend}
Files scanned: ${result.filesScanned}
Rules executed: ${result.rulesExecuted}
Issues found: ${result.issues.length}

Severity summary:
CRITICAL  ${result.summary.CRITICAL}
HIGH      ${result.summary.HIGH}
MEDIUM    ${result.summary.MEDIUM}
LOW       ${result.summary.LOW}
INFO      ${result.summary.INFO}

${renderDeepAnalysis(result)}
${result.issues.map(renderIssue).join("\n")}
${result.parserWarnings.length > 0 ? `Parser warnings: ${result.parserWarnings.length}\n` : ""}`;
}
