import type { Assignment, CircuitIR, Constraint, SignalDeclaration, SourceLocation } from "../types.js";
import { baseSignalName, extractSignalReferences, normalizeSignalReference } from "../frontends/circom/circom-utils.js";

function namesEquivalent(reference: string, signalName: string): boolean {
  const ref = normalizeSignalReference(reference);
  const sig = normalizeSignalReference(signalName);
  return ref === sig || baseSignalName(ref) === baseSignalName(sig);
}

function expressionMentionsSignal(expression: string, signalName: string): boolean {
  return extractSignalReferences(expression).some((ref) => namesEquivalent(ref, signalName));
}

export class ConstraintGraph {
  private constraintSignals = new Set<string>();
  private equalitySignals = new Set<string>();
  private assignmentMap = new Map<string, Assignment[]>();

  constructor(private readonly ir: CircuitIR) {
    for (const assignment of ir.assignments) {
      const key = baseSignalName(assignment.lhs);
      const existing = this.assignmentMap.get(key) ?? [];
      existing.push(assignment);
      this.assignmentMap.set(key, existing);
    }
    for (const constraint of ir.constraints) {
      for (const ref of constraint.referencedSignals) {
        this.constraintSignals.add(baseSignalName(ref));
        if (constraint.operator === "===") this.equalitySignals.add(baseSignalName(ref));
      }
      if (constraint.lhs) this.constraintSignals.add(baseSignalName(constraint.lhs));
    }
  }

  declaredSignals(): SignalDeclaration[] {
    return this.ir.signals;
  }

  inputSignals(): SignalDeclaration[] {
    return this.ir.signals.filter((signal) => signal.kind === "input");
  }

  publicInputSignals(): SignalDeclaration[] {
    return this.inputSignals();
  }

  outputSignals(): SignalDeclaration[] {
    return this.ir.signals.filter((signal) => signal.kind === "output");
  }

  assignedByHint(): Assignment[] {
    return this.ir.assignments.filter((assignment) => assignment.operator === "<--");
  }

  assignedByConstraint(): Assignment[] {
    return this.ir.assignments.filter((assignment) => assignment.operator === "<==");
  }

  constraintsForSignal(signalName: string): Constraint[] {
    return this.ir.constraints.filter((constraint) => {
      if (constraint.lhs && namesEquivalent(constraint.lhs, signalName)) return true;
      return constraint.referencedSignals.some((ref) => namesEquivalent(ref, signalName));
    });
  }

  assignmentsForSignal(signalName: string): Assignment[] {
    return this.ir.assignments.filter((assignment) => namesEquivalent(assignment.lhs, signalName));
  }

  appearsInAnyConstraint(signalName: string): boolean {
    return this.constraintSignals.has(baseSignalName(signalName)) || this.constraintsForSignal(signalName).length > 0;
  }

  appearsInEqualityConstraint(signalName: string): boolean {
    return this.equalitySignals.has(baseSignalName(signalName)) || this.constraintsForSignal(signalName).some((constraint) => constraint.operator === "===");
  }

  onlyAssignedButNeverConstrained(): Assignment[] {
    return this.assignedByHint().filter((assignment) => !this.appearsInAnyConstraint(assignment.lhs));
  }

  unboundInputs(): SignalDeclaration[] {
    return this.inputSignals().filter((signal) => !this.appearsInAnyConstraint(signal.name));
  }

  unconstrainedOutputs(): SignalDeclaration[] {
    return this.outputSignals().filter((signal) => {
      const assignments = this.assignmentsForSignal(signal.name);
      return assignments.some((assignment) => assignment.operator === "<--") || !this.appearsInAnyConstraint(signal.name);
    });
  }

  hasBooleanityConstraint(signalName: string): boolean {
    const escaped = signalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\[\\\]/g, "(?:\\[[^\\]]+\\])?");
    const compactPatterns = [
      new RegExp(`${escaped}\\*\\(${escaped}-1\\)===0`),
      new RegExp(`${escaped}\\*\\(1-${escaped}\\)===0`),
      new RegExp(`\\(${escaped}-1\\)\\*${escaped}===0`)
    ];
    return this.ir.constraints.some((constraint) => {
      const compact = constraint.expression.replace(/\s+/g, "");
      if (compactPatterns.some((pattern) => pattern.test(compact))) return true;
      return /Num2Bits|Bits2Num/.test(constraint.expression) && expressionMentionsSignal(constraint.expression, signalName);
    });
  }

  hasRangeCheck(signalName: string): boolean {
    const rangePattern = /Num2Bits|Bits2Num|LessThan|LessEqThan|GreaterThan|GreaterEqThan|RangeCheck|rangeCheck|Decompose|AliasCheck|bits?\[/;
    const rangeComponentNames = new Set(
      this.ir.components.filter((component) => rangePattern.test(`${component.templateType ?? ""}${component.name}`)).map((component) => component.name)
    );
    return (
      this.ir.components.some((component) => rangePattern.test(`${component.templateType ?? ""}${component.name}`) && component.inputs.some((input) => expressionMentionsSignal(input, signalName))) ||
      this.ir.constraints.some(
        (constraint) =>
          constraint.lhs !== undefined &&
          rangeComponentNames.has(constraint.lhs.split(".")[0] ?? "") &&
          constraint.referencedSignals.some((ref) => namesEquivalent(ref, signalName))
      ) ||
      this.ir.constraints.some((constraint) => rangePattern.test(constraint.expression) && expressionMentionsSignal(constraint.expression, signalName)) ||
      this.ir.assignments.some((assignment) => rangePattern.test(`${assignment.rhs} ${assignment.lhs}`) && assignment.referencedSignals.some((ref) => namesEquivalent(ref, signalName)))
    );
  }

  isComponentOutputReference(reference: string): boolean {
    const normalized = normalizeSignalReference(reference);
    return this.ir.components.some((component) => normalized.startsWith(`${component.name}.`));
  }

  isComponentOutputConstrained(reference: string): boolean {
    return this.ir.constraints.some((constraint) => expressionMentionsSignal(constraint.expression, reference));
  }

  signalReferences(signalName: string): SourceLocation[] {
    const refs: SourceLocation[] = [];
    for (const assignment of this.ir.assignments) {
      if (assignment.referencedSignals.some((ref) => namesEquivalent(ref, signalName)) || namesEquivalent(assignment.lhs, signalName)) refs.push(assignment);
    }
    for (const constraint of this.ir.constraints) {
      if (constraint.referencedSignals.some((ref) => namesEquivalent(ref, signalName))) refs.push(constraint);
    }
    for (const assertion of this.ir.assertions) {
      if (assertion.referencedSignals.some((ref) => namesEquivalent(ref, signalName))) refs.push(assertion);
    }
    return refs;
  }
}
