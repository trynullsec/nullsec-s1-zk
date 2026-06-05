function renderIssue(issue) {
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
export function renderMarkdownReport(result) {
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

${result.issues.map(renderIssue).join("\n")}
${result.parserWarnings.length > 0 ? `\n## Parser Warnings\n\n${result.parserWarnings.map((warning) => `- \`${warning.file}:${warning.line}\` ${warning.message}`).join("\n")}\n` : ""}
`;
}
//# sourceMappingURL=markdown.js.map