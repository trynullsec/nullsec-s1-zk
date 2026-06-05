import type { Assignment, CircuitIR } from "../types.js";
export declare function assignmentsInto(signalName: string, ir: CircuitIR): Assignment[];
export declare function downstreamAssignments(signalName: string, ir: CircuitIR): Assignment[];
