import type { Assignment, CircuitIR } from "../types.js";
import { baseSignalName } from "../frontends/circom/circom-utils.js";

export function assignmentsInto(signalName: string, ir: CircuitIR): Assignment[] {
  const target = baseSignalName(signalName);
  return ir.assignments.filter((assignment) => baseSignalName(assignment.lhs) === target);
}

export function downstreamAssignments(signalName: string, ir: CircuitIR): Assignment[] {
  const target = baseSignalName(signalName);
  return ir.assignments.filter((assignment) => assignment.referencedSignals.some((ref) => baseSignalName(ref) === target));
}
