import { baseSignalName } from "../frontends/circom/circom-utils.js";
const PRIMARY_RANGE_CATEGORIES = new Set([
    "amount",
    "balance",
    "fee",
    "nonce",
    "index",
    "timestamp",
    "quantity",
    "count",
    "size",
    "limb"
]);
const HASH_COMPONENT_PATTERN = /Poseidon|Pedersen|Rescue|MiMC|MimcSponge|Sha256|Blake/i;
function sameTemplate(a, b) {
    if (!a || !b)
        return true;
    return a === b;
}
export function classifyRangeCheckSignal(name, kind) {
    const lower = name.toLowerCase();
    if (/nullifier/.test(lower))
        return "nullifier";
    if (/hash/.test(lower))
        return "hash";
    if (/commitment/.test(lower))
        return "commitment";
    if (/^root$|merkleroot|merkle_root|computedroot|state_root|treeroot/.test(lower) || (lower.includes("root") && kind === "input")) {
        return "root";
    }
    if (kind === "output" && /^remaining|^allowed|^total|^new|^updated|^adjusted|^resulting|^computed/.test(lower)) {
        return "derived";
    }
    if (/selector|select/.test(lower))
        return "selector";
    if (lower === "amount" || /(^|_)amount($|_)/.test(lower))
        return "amount";
    if (lower === "balance" || /(^|_)balance($|_)/.test(lower))
        return "balance";
    if (/\bfee\b|^fee|_fee$/.test(lower))
        return "fee";
    if (/\bnonce\b/.test(lower))
        return "nonce";
    if (/\bindex\b|\bidx\b|_index$|_idx$/.test(lower))
        return "index";
    if (/timestamp|time_stamp/.test(lower))
        return "timestamp";
    if (/\bquantity\b|\bqty\b/.test(lower))
        return "quantity";
    if (/\bcount\b/.test(lower))
        return "count";
    if (/\bsize\b|\blength\b/.test(lower))
        return "size";
    if (/\blimb\b|\blimbs\b/.test(lower))
        return "limb";
    return "unknown";
}
export function isHashLikeCategory(category) {
    return category === "hash" || category === "commitment" || category === "root" || category === "nullifier";
}
export function isPrimaryRangeCategory(category) {
    return PRIMARY_RANGE_CATEGORIES.has(category);
}
function namesEquivalent(reference, signalName) {
    return baseSignalName(reference) === baseSignalName(signalName);
}
export function isHashComponentOutput(signal, context) {
    return context.graph.assignmentsForSignal(signal.name).some((assignment) => {
        const match = assignment.rhs.match(/^([A-Za-z_][A-Za-z0-9_]*)\.out\b/);
        if (!match)
            return false;
        const component = context.ir.components.find((candidate) => candidate.name === match[1]);
        return Boolean(component && HASH_COMPONENT_PATTERN.test(component.templateType ?? ""));
    });
}
export function isUsedAsBoundedInteger(signal, context) {
    const references = context.graph.signalReferences(signal.name).filter((ref) => sameTemplate(ref.templateName, signal.templateName));
    return references.some((ref) => {
        const snippet = (ref.snippet ?? "").replace(/\s+/g, " ");
        if (/LessThan|LessEqThan|GreaterThan|GreaterEqThan|Num2Bits|RangeCheck|rangeCheck|AliasCheck|Decompose/.test(snippet)) {
            return true;
        }
        const mentionsSignal = snippet.includes(signal.baseName);
        if (!mentionsSignal)
            return false;
        if (/[+\-*/]/.test(snippet) && !/===/.test(snippet))
            return true;
        if (/===/.test(snippet) && /[+\-*/]/.test(snippet))
            return true;
        return false;
    });
}
export function operandsHaveRangeCheck(signal, context) {
    const assignments = context.graph
        .assignmentsForSignal(signal.name)
        .filter((assignment) => sameTemplate(assignment.templateName, signal.templateName));
    return assignments.some((assignment) => {
        const operands = assignment.referencedSignals.filter((ref) => !namesEquivalent(ref, signal.name));
        const primaryOperands = operands.filter((operand) => isPrimaryRangeCategory(classifyRangeCheckSignal(baseSignalName(operand), "input")));
        if (primaryOperands.length === 0)
            return true;
        return primaryOperands.every((operand) => context.graph.hasRangeCheck(operand, signal.templateName));
    });
}
function isArithmeticOutput(signal, context) {
    if (signal.kind !== "output")
        return false;
    return context.graph
        .assignmentsForSignal(signal.name)
        .filter((assignment) => sameTemplate(assignment.templateName, signal.templateName))
        .some((assignment) => /[+\-*/]/.test(assignment.rhs));
}
export function assessRangeCheckRisk(signal, context) {
    const category = classifyRangeCheckSignal(signal.baseName, signal.kind);
    const templateName = signal.templateName;
    if (context.graph.hasRangeCheck(signal.name, templateName)) {
        return {
            shouldReport: false,
            category,
            confidence: "HIGH",
            severity: "INFO",
            explanation: "Signal already has an obvious range-check pattern."
        };
    }
    if (context.graph.signalReferences(signal.name).filter((ref) => sameTemplate(ref.templateName, templateName)).length === 0) {
        return {
            shouldReport: false,
            category,
            confidence: "LOW",
            severity: "INFO",
            explanation: "Signal is not referenced in parsed constraints or assignments."
        };
    }
    const hashOutput = isHashComponentOutput(signal, context);
    const boundedIntegerUse = isUsedAsBoundedInteger(signal, context);
    const derivedOutput = category === "derived" || isArithmeticOutput(signal, context);
    const operandsChecked = operandsHaveRangeCheck(signal, context);
    if (hashOutput || isHashLikeCategory(category)) {
        if (!boundedIntegerUse) {
            return {
                shouldReport: false,
                category,
                confidence: "LOW",
                severity: "INFO",
                explanation: `The ${category} signal \`${signal.name}\` is used for binding or hashing, not as a bounded integer.`
            };
        }
        return {
            shouldReport: true,
            category,
            confidence: "LOW",
            severity: "LOW",
            explanation: `The ${category} signal \`${signal.name}\` is used in arithmetic without an obvious range-check pattern. Confidence is low because hash-like values are usually field elements, not bounded integers.`
        };
    }
    if (category === "derived" || derivedOutput) {
        if (operandsChecked) {
            return {
                shouldReport: false,
                category: "derived",
                confidence: "LOW",
                severity: "INFO",
                explanation: `The derived output \`${signal.name}\` is computed from operands that already have range checks.`
            };
        }
        if (signal.kind === "output") {
            return {
                shouldReport: true,
                category: "derived",
                confidence: "LOW",
                severity: "MEDIUM",
                explanation: `The derived output \`${signal.name}\` is produced by arithmetic without an obvious range check on its operands or result.`
            };
        }
    }
    if (isPrimaryRangeCategory(category)) {
        const inputTarget = signal.kind === "input";
        return {
            shouldReport: true,
            category,
            confidence: inputTarget ? "HIGH" : "MEDIUM",
            severity: inputTarget ? "HIGH" : "MEDIUM",
            explanation: `The ${category} signal \`${signal.name}\` is used without an obvious Num2Bits, RangeCheck, comparator, decomposition, or AliasCheck pattern.`
        };
    }
    return {
        shouldReport: false,
        category,
        confidence: "LOW",
        severity: "INFO",
        explanation: `The signal \`${signal.name}\` does not match a primary bounded-integer range-check target.`
    };
}
//# sourceMappingURL=range-check-classifier.js.map