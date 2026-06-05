import type { Assignment, CircuitIR, Constraint, SignalDeclaration, SourceLocation } from "../types.js";
export declare class ConstraintGraph {
    private readonly ir;
    private constraintSignals;
    private equalitySignals;
    private assignmentMap;
    constructor(ir: CircuitIR);
    declaredSignals(): SignalDeclaration[];
    inputSignals(): SignalDeclaration[];
    publicInputSignals(): SignalDeclaration[];
    outputSignals(): SignalDeclaration[];
    assignedByHint(): Assignment[];
    assignedByConstraint(): Assignment[];
    constraintsForSignal(signalName: string): Constraint[];
    assignmentsForSignal(signalName: string): Assignment[];
    appearsInAnyConstraint(signalName: string): boolean;
    appearsInEqualityConstraint(signalName: string): boolean;
    onlyAssignedButNeverConstrained(): Assignment[];
    unboundInputs(): SignalDeclaration[];
    unconstrainedOutputs(): SignalDeclaration[];
    hasBooleanityConstraint(signalName: string): boolean;
    hasRangeCheck(signalName: string, templateName?: string): boolean;
    isComponentOutputReference(reference: string): boolean;
    isComponentOutputConstrained(reference: string): boolean;
    signalReferences(signalName: string): SourceLocation[];
}
