import { buildIssue } from "../core/issue-builder.js";
import { expressionHasHashContext, isHighValueNumericName, isNumericLikeName } from "../frontends/circom/circom-utils.js";
export const missingRangeCheckRule = {
    id: "NS-ZK-006",
    title: "Missing range check",
    description: "Detects numeric-like signals without obvious range-checking mechanisms.",
    defaultSeverity: "MEDIUM",
    tags: ["range", "overflow", "aliasing"],
    analyze(context) {
        return context.graph
            .declaredSignals()
            .filter((signal) => isNumericLikeName(signal.baseName) && context.graph.signalReferences(signal.name).length > 0 && !context.graph.hasRangeCheck(signal.name))
            .map((signal) => {
            const references = context.graph.signalReferences(signal.name);
            const highValue = signal.kind === "input" ||
                signal.kind === "output" ||
                isHighValueNumericName(signal.baseName) ||
                references.some((ref) => expressionHasHashContext(ref.snippet ?? ""));
            return buildIssue({
                ruleId: "NS-ZK-006",
                title: "Missing range check",
                severity: highValue ? "HIGH" : "MEDIUM",
                confidence: "MEDIUM",
                location: signal,
                signalName: signal.name,
                explanation: `The numeric-like signal \`${signal.name}\` is used without an obvious Num2Bits, RangeCheck, comparator, decomposition, or AliasCheck pattern.`,
                impact: "Field elements are not naturally bounded integers. Missing range checks can cause overflows, aliasing, invalid comparisons, or inconsistent protocol semantics.",
                suggestedFix: "Constrain the value with an explicit bit decomposition, range-check gadget, comparator, or protocol-specific bounded representation.",
                tags: missingRangeCheckRule.tags
            });
        });
    }
};
//# sourceMappingURL=NS-ZK-006-missing-range-check.js.map