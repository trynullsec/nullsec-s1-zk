import { isEcLikeName } from "./halo2-patterns.js";
import type { Halo2Assignment } from "./halo2-types.js";
import { Halo2ConstraintGraph } from "./halo2-constraint-graph.js";

export interface Halo2AssignmentFlow {
  assignment: Halo2Assignment;
  connected: boolean;
  connections: string[];
  ecRelated: boolean;
}

export function assignmentFlows(graph: Halo2ConstraintGraph): Halo2AssignmentFlow[] {
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

export function unconstrainedAssignments(graph: Halo2ConstraintGraph): Halo2AssignmentFlow[] {
  return assignmentFlows(graph).filter((flow) => !flow.connected);
}

export function unconstrainedEcAssignments(graph: Halo2ConstraintGraph): Halo2AssignmentFlow[] {
  return unconstrainedAssignments(graph).filter((flow) => flow.ecRelated);
}
