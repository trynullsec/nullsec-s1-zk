import { baseSignalName } from "../frontends/circom/circom-utils.js";
export function assignmentsInto(signalName, ir) {
    const target = baseSignalName(signalName);
    return ir.assignments.filter((assignment) => baseSignalName(assignment.lhs) === target);
}
export function downstreamAssignments(signalName, ir) {
    const target = baseSignalName(signalName);
    return ir.assignments.filter((assignment) => assignment.referencedSignals.some((ref) => baseSignalName(ref) === target));
}
//# sourceMappingURL=dataflow.js.map