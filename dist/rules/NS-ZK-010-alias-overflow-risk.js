import { buildIssue } from "../core/issue-builder.js";
const BN254_SAFE_BITS = 253;
export const aliasOverflowRiskRule = {
    id: "NS-ZK-010",
    title: "Alias or overflow risk",
    description: "Detects suspicious bit decompositions and limb arrays that may allow aliasing.",
    defaultSeverity: "MEDIUM",
    tags: ["aliasing", "overflow", "range"],
    analyze(context) {
        const issues = [];
        for (const component of context.ir.components) {
            const width = Number(component.params?.match(/\d+/)?.[0]);
            if (/Num2Bits|Bits2Num|Decompose/.test(component.templateType ?? "") && width >= BN254_SAFE_BITS) {
                const hasAliasCheck = context.ir.components.some((candidate) => /AliasCheck/.test(candidate.templateType ?? ""));
                if (!hasAliasCheck) {
                    issues.push(buildIssue({
                        ruleId: "NS-ZK-010",
                        title: "Alias or overflow risk",
                        severity: width >= 254 ? "HIGH" : "MEDIUM",
                        confidence: "MEDIUM",
                        location: component,
                        signalName: component.name,
                        explanation: `The component \`${component.name}\` uses ${component.templateType}(${width}) near or above the BN254 scalar field bit length without an obvious AliasCheck.`,
                        impact: "Values may have multiple field representations or exceed intended integer ranges.",
                        suggestedFix: "Use a safe bit width for the field, add AliasCheck for large decompositions, and document the intended integer domain.",
                        tags: aliasOverflowRiskRule.tags
                    }));
                }
            }
        }
        for (const signal of context.ir.signals.filter((signal) => signal.arrayDimensions.length > 0 && /limb/i.test(signal.name) && !context.graph.hasRangeCheck(signal.name))) {
            issues.push(buildIssue({
                ruleId: "NS-ZK-010",
                title: "Alias or overflow risk",
                severity: "MEDIUM",
                confidence: "LOW",
                location: signal,
                signalName: signal.name,
                explanation: `The limb array \`${signal.name}\` does not have an obvious per-limb bound in the parsed constraints.`,
                impact: "Unbounded limbs can overflow their intended representation or admit multiple encodings.",
                suggestedFix: "Add explicit per-limb range checks and recomposition constraints.",
                tags: aliasOverflowRiskRule.tags
            }));
        }
        return issues;
    }
};
//# sourceMappingURL=NS-ZK-010-alias-overflow-risk.js.map