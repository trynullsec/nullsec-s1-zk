import type { Halo2Assignment } from "./halo2-types.js";
import { Halo2ConstraintGraph } from "./halo2-constraint-graph.js";
export interface Halo2AssignmentFlow {
    assignment: Halo2Assignment;
    connected: boolean;
    connections: string[];
    ecRelated: boolean;
}
export declare function assignmentFlows(graph: Halo2ConstraintGraph): Halo2AssignmentFlow[];
export declare function unconstrainedAssignments(graph: Halo2ConstraintGraph): Halo2AssignmentFlow[];
export declare function unconstrainedEcAssignments(graph: Halo2ConstraintGraph): Halo2AssignmentFlow[];
