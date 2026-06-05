import { isEcLikeName } from "./halo2-patterns.js";
export function assignmentFlows(graph) {
    return graph.ir.assignments.map((assignment) => {
        const connections = graph.assignmentConnections(assignment);
        return {
            assignment,
            connected: connections.length > 0,
            connections,
            ecRelated: isEcLikeName(`${assignment.expression} ${assignment.label ?? ""} ${assignment.columnName ?? ""} ${assignment.assignedVariable ?? ""}`)
        };
    });
}
export function unconstrainedAssignments(graph) {
    return assignmentFlows(graph).filter((flow) => !flow.connected);
}
export function unconstrainedEcAssignments(graph) {
    return unconstrainedAssignments(graph).filter((flow) => flow.ecRelated);
}
//# sourceMappingURL=halo2-dataflow.js.map