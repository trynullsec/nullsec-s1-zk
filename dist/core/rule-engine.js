import { compareSeverity, normalizeSeverity } from "./severity.js";
import { resetIssueCounter } from "./issue-builder.js";
function configuredSeverity(ruleId, configValue, fallback) {
    return normalizeSeverity(configValue, fallback);
}
export class RuleEngine {
    rules;
    constructor(rules) {
        this.rules = rules;
    }
    run(context) {
        resetIssueCounter();
        const issues = [];
        let rulesExecuted = 0;
        for (const rule of this.rules) {
            const setting = context.config.rules[rule.id] ?? context.config.rules[rule.id.replace(/-.*/, "")];
            if (String(setting).toLowerCase() === "off")
                continue;
            rulesExecuted += 1;
            const ruleIssues = rule.analyze(context).map((issue) => ({
                ...issue,
                severity: configuredSeverity(rule.id, typeof setting === "string" ? setting : undefined, issue.severity)
            }));
            issues.push(...ruleIssues);
        }
        return { issues: this.sortAndDeduplicate(issues), rulesExecuted };
    }
    sortAndDeduplicate(issues) {
        const seen = new Set();
        const deduped = [];
        for (const issue of issues) {
            const key = `${issue.ruleId}:${issue.file}:${issue.line}:${issue.signalName ?? ""}:${issue.snippet ?? ""}`;
            if (seen.has(key))
                continue;
            seen.add(key);
            deduped.push(issue);
        }
        return deduped.sort((a, b) => compareSeverity(a.severity, b.severity) || a.file.localeCompare(b.file) || a.line - b.line);
    }
}
//# sourceMappingURL=rule-engine.js.map