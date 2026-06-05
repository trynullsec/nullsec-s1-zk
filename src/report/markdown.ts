import type { AuditResult, Issue } from "../types.js";

function renderIssue(issue: Issue): string {
  return `## [${issue.severity}] ${issue.ruleId} ${issue.title}

**File:** \`${issue.file}:${issue.line}\`  
**Template:** ${issue.templateName ? `\`${issue.templateName}\`` : "unknown"}  
**Confidence:** ${issue.confidence}

\`\`\`circom
${issue.snippet ?? ""}
\`\`\`

### Why This Matters
${issue.explanation}

### Impact
${issue.impact}

### Suggested Fix
${issue.suggestedFix}
`;
}

function renderDeepAnalysis(result: AuditResult): string {
  const deep = result.deepAnalysis;
  if (!deep) return "";
  const summary = deep.proofObligationSummary;
  return `## Proof Obligations

- Total inferred: ${summary.total}
- Satisfied: ${summary.satisfied}
- Partial: ${summary.partially_satisfied}
- Missing: ${summary.missing}
- Unknown: ${summary.unknown}

## Exploit Hypotheses

${deep.exploitHypotheses
  .slice(0, 10)
  .map(
    (hypothesis) => `### ${hypothesis.issueId}

${hypothesis.hypothesis}

**Attacker control:** ${hypothesis.attackerControl}

**Broken assumption:** ${hypothesis.brokenAssumption}

**Possible impact:** ${hypothesis.possibleImpact}

**Patch direction:** ${hypothesis.patchDirection}
`
  )
  .join("\n")}
`;
}

export function renderMarkdownReport(result: AuditResult): string {
  return `# Nullsec S1-ZK Report

AI-native auditing for zero-knowledge circuits. Find underconstraints before they mint infinite money.

**Target:** \`${result.target}\`  
**Frontend:** ${result.frontend}  
**Files scanned:** ${result.filesScanned}  
**Rules executed:** ${result.rulesExecuted}  
**Issues found:** ${result.issues.length}

## Severity Summary

- CRITICAL: ${result.summary.CRITICAL}
- HIGH: ${result.summary.HIGH}
- MEDIUM: ${result.summary.MEDIUM}
- LOW: ${result.summary.LOW}
- INFO: ${result.summary.INFO}

${renderDeepAnalysis(result)}
${result.issues.map(renderIssue).join("\n")}
${result.parserWarnings.length > 0 ? `\n## Parser Warnings\n\n${result.parserWarnings.map((warning) => `- \`${warning.file}:${warning.line}\` ${warning.message}`).join("\n")}\n` : ""}
`;
}
