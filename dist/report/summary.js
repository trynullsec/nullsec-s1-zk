export function summarizeIssues(issues) {
    return issues.reduce((summary, issue) => {
        summary[issue.severity] += 1;
        return summary;
    }, { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 });
}
//# sourceMappingURL=summary.js.map