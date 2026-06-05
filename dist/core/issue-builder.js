let issueCounter = 0;
export function resetIssueCounter() {
    issueCounter = 0;
}
export function buildIssue(input) {
    issueCounter += 1;
    return {
        id: `${input.ruleId}-${String(issueCounter).padStart(4, "0")}`,
        ruleId: input.ruleId,
        title: input.title,
        severity: input.severity,
        confidence: input.confidence ?? "HIGH",
        file: input.location.file,
        line: input.location.line,
        column: input.location.column,
        snippet: input.location.snippet,
        templateName: input.location.templateName,
        signalName: input.signalName,
        explanation: input.explanation,
        impact: input.impact,
        suggestedFix: input.suggestedFix,
        references: input.references,
        tags: input.tags ?? [],
        metadata: input.metadata
    };
}
//# sourceMappingURL=issue-builder.js.map