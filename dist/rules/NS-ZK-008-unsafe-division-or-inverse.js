import { buildIssue } from "../core/issue-builder.js";
import { expressionHasDivisionOrInverse } from "../frontends/circom/circom-utils.js";
function denominatorOf(expression) {
    const match = expression.match(/\/\s*([A-Za-z_][A-Za-z0-9_.\[\]]*)/);
    return match?.[1];
}
function hasNonzeroGuard(assignment, denominator, context) {
    if (!denominator)
        return /Safe|NonZero|AssertNonZero/i.test(assignment.rhs);
    return context.ir.constraints.some((constraint) => {
        const compact = constraint.expression.replace(/\s+/g, "");
        return compact.includes(`${denominator}*`) && compact.includes("===1");
    });
}
export const unsafeDivisionOrInverseRule = {
    id: "NS-ZK-008",
    title: "Unsafe division or inverse",
    description: "Detects division, inverse, and IsZero-like patterns without clear nonzero guards.",
    defaultSeverity: "HIGH",
    tags: ["division", "inverse", "nonzero"],
    analyze(context) {
        return context.ir.assignments
            .filter((assignment) => expressionHasDivisionOrInverse(assignment.rhs))
            .filter((assignment) => !hasNonzeroGuard(assignment, denominatorOf(assignment.rhs), context))
            .map((assignment) => buildIssue({
            ruleId: "NS-ZK-008",
            title: "Unsafe division or inverse",
            severity: assignment.rhs.includes("/") ? "HIGH" : "MEDIUM",
            confidence: assignment.rhs.includes("/") ? "HIGH" : "MEDIUM",
            location: assignment,
            signalName: assignment.lhs,
            explanation: `The expression \`${assignment.rhs}\` uses division or inversion without an obvious nonzero guard.`,
            impact: "Division and inversion require careful nonzero constraints. Missing guards can create unsound edge cases.",
            suggestedFix: "Add explicit nonzero constraints or use a vetted safe inversion/IsZero gadget.",
            tags: unsafeDivisionOrInverseRule.tags
        }));
    }
};
//# sourceMappingURL=NS-ZK-008-unsafe-division-or-inverse.js.map