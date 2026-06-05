import { baseSignalName, extractSignalReferences, normalizeSignalReference } from "../frontends/circom/circom-utils.js";
function namesEquivalent(reference, signalName) {
    const ref = normalizeSignalReference(reference);
    const sig = normalizeSignalReference(signalName);
    return ref === sig || baseSignalName(ref) === baseSignalName(sig);
}
function expressionMentionsSignal(expression, signalName) {
    return extractSignalReferences(expression).some((ref) => namesEquivalent(ref, signalName));
}
export class ConstraintGraph {
    ir;
    constraintSignals = new Set();
    equalitySignals = new Set();
    assignmentMap = new Map();
    constructor(ir) {
        this.ir = ir;
        for (const assignment of ir.assignments) {
            const key = baseSignalName(assignment.lhs);
            const existing = this.assignmentMap.get(key) ?? [];
            existing.push(assignment);
            this.assignmentMap.set(key, existing);
        }
        for (const constraint of ir.constraints) {
            for (const ref of constraint.referencedSignals) {
                this.constraintSignals.add(baseSignalName(ref));
                if (constraint.operator === "===")
                    this.equalitySignals.add(baseSignalName(ref));
            }
            if (constraint.lhs)
                this.constraintSignals.add(baseSignalName(constraint.lhs));
        }
    }
    declaredSignals() {
        return this.ir.signals;
    }
    inputSignals() {
        return this.ir.signals.filter((signal) => signal.kind === "input");
    }
    publicInputSignals() {
        return this.inputSignals();
    }
    outputSignals() {
        return this.ir.signals.filter((signal) => signal.kind === "output");
    }
    assignedByHint() {
        return this.ir.assignments.filter((assignment) => assignment.operator === "<--");
    }
    assignedByConstraint() {
        return this.ir.assignments.filter((assignment) => assignment.operator === "<==");
    }
    constraintsForSignal(signalName) {
        return this.ir.constraints.filter((constraint) => {
            if (constraint.lhs && namesEquivalent(constraint.lhs, signalName))
                return true;
            return constraint.referencedSignals.some((ref) => namesEquivalent(ref, signalName));
        });
    }
    assignmentsForSignal(signalName) {
        return this.ir.assignments.filter((assignment) => namesEquivalent(assignment.lhs, signalName));
    }
    appearsInAnyConstraint(signalName) {
        return this.constraintSignals.has(baseSignalName(signalName)) || this.constraintsForSignal(signalName).length > 0;
    }
    appearsInEqualityConstraint(signalName) {
        return this.equalitySignals.has(baseSignalName(signalName)) || this.constraintsForSignal(signalName).some((constraint) => constraint.operator === "===");
    }
    onlyAssignedButNeverConstrained() {
        return this.assignedByHint().filter((assignment) => !this.appearsInAnyConstraint(assignment.lhs));
    }
    unboundInputs() {
        return this.inputSignals().filter((signal) => !this.appearsInAnyConstraint(signal.name));
    }
    unconstrainedOutputs() {
        return this.outputSignals().filter((signal) => {
            const assignments = this.assignmentsForSignal(signal.name);
            return assignments.some((assignment) => assignment.operator === "<--") || !this.appearsInAnyConstraint(signal.name);
        });
    }
    hasBooleanityConstraint(signalName) {
        const escaped = signalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\[\\\]/g, "(?:\\[[^\\]]+\\])?");
        const compactPatterns = [
            new RegExp(`${escaped}\\*\\(${escaped}-1\\)===0`),
            new RegExp(`${escaped}\\*\\(1-${escaped}\\)===0`),
            new RegExp(`\\(${escaped}-1\\)\\*${escaped}===0`)
        ];
        return this.ir.constraints.some((constraint) => {
            const compact = constraint.expression.replace(/\s+/g, "");
            if (compactPatterns.some((pattern) => pattern.test(compact)))
                return true;
            return /Num2Bits|Bits2Num/.test(constraint.expression) && expressionMentionsSignal(constraint.expression, signalName);
        });
    }
    hasRangeCheck(signalName, templateName) {
        const rangePattern = /Num2Bits|Bits2Num|LessThan|LessEqThan|GreaterThan|GreaterEqThan|RangeCheck|rangeCheck|Decompose|AliasCheck|bits?\[/;
        const inScope = (node) => !templateName || !node.templateName || node.templateName === templateName;
        const rangeComponents = this.ir.components.filter((component) => inScope(component) && rangePattern.test(`${component.templateType ?? ""}${component.name}`));
        const rangeComponentNames = new Set(rangeComponents.map((component) => component.name));
        return (rangeComponents.some((component) => component.inputs.some((input) => expressionMentionsSignal(input, signalName))) ||
            this.ir.constraints.some((constraint) => inScope(constraint) &&
                constraint.lhs !== undefined &&
                rangeComponentNames.has(constraint.lhs.split(".")[0] ?? "") &&
                constraint.referencedSignals.some((ref) => namesEquivalent(ref, signalName))) ||
            this.ir.constraints.some((constraint) => inScope(constraint) && rangePattern.test(constraint.expression) && expressionMentionsSignal(constraint.expression, signalName)) ||
            this.ir.assignments.some((assignment) => inScope(assignment) && rangePattern.test(`${assignment.rhs} ${assignment.lhs}`) && assignment.referencedSignals.some((ref) => namesEquivalent(ref, signalName))));
    }
    isComponentOutputReference(reference) {
        const normalized = normalizeSignalReference(reference);
        return this.ir.components.some((component) => normalized.startsWith(`${component.name}.`));
    }
    isComponentOutputConstrained(reference) {
        return this.ir.constraints.some((constraint) => expressionMentionsSignal(constraint.expression, reference));
    }
    signalReferences(signalName) {
        const refs = [];
        for (const assignment of this.ir.assignments) {
            if (assignment.referencedSignals.some((ref) => namesEquivalent(ref, signalName)) || namesEquivalent(assignment.lhs, signalName))
                refs.push(assignment);
        }
        for (const constraint of this.ir.constraints) {
            if (constraint.referencedSignals.some((ref) => namesEquivalent(ref, signalName)))
                refs.push(constraint);
        }
        for (const assertion of this.ir.assertions) {
            if (assertion.referencedSignals.some((ref) => namesEquivalent(ref, signalName)))
                refs.push(assertion);
        }
        return refs;
    }
}
//# sourceMappingURL=constraint-graph.js.map