import { buildIssue } from "../core/issue-builder.js";
import { assessRangeCheckRisk } from "../core/range-check-classifier.js";
export const missingRangeCheckRule = {
    id: "NS-ZK-006",
    title: "Missing range check",
    description: "Detects bounded-integer signals without obvious range-checking mechanisms.",
    defaultSeverity: "MEDIUM",
    tags: ["range", "overflow", "aliasing"],
    analyze(context) {
        const issues = [];
        for (const signal of context.graph.declaredSignals()) {
            const assessment = assessRangeCheckRisk(signal, context);
            if (!assessment.shouldReport)
                continue;
            issues.push(buildIssue({
                ruleId: "NS-ZK-006",
                title: "Missing range check",
                severity: assessment.severity,
                confidence: assessment.confidence,
                location: signal,
                signalName: signal.name,
                explanation: assessment.explanation,
                impact: "Field elements are not naturally bounded integers. Missing range checks can cause overflows, aliasing, invalid comparisons, or inconsistent protocol semantics.",
                suggestedFix: "Constrain the value with an explicit bit decomposition, range-check gadget, comparator, or protocol-specific bounded representation.",
                tags: missingRangeCheckRule.tags,
                metadata: { category: assessment.category }
            }));
        }
        return issues;
    }
};
//# sourceMappingURL=NS-ZK-006-missing-range-check.js.map