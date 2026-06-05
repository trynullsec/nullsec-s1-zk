import type { Halo2Assignment, Halo2Gate, Halo2IR, Halo2InstanceConstraint, Halo2Lookup, Halo2Query, Halo2Region, Halo2Selector } from "./halo2-types.js";
export interface Halo2GateConstraint {
    gate: Halo2Gate;
    selectorColumns: string[];
    adviceColumns: string[];
    instanceColumns: string[];
    fixedColumns: string[];
    expressions: string[];
    variableReferences: string[];
}
export interface Halo2AssignmentNode {
    id: string;
    assignment: Halo2Assignment;
    columnName?: string;
    label?: string;
    cellVariable?: string;
    region?: Halo2Region;
    connectedBy: string[];
}
export interface Halo2ConstraintModel {
    gates: Halo2GateConstraint[];
    assignments: Halo2AssignmentNode[];
    selectors: Halo2Selector[];
    instanceQueries: Halo2Query[];
    instanceBindings: Halo2InstanceConstraint[];
    lookups: Halo2Lookup[];
}
export declare function extractHalo2ConstraintModel(ir: Halo2IR): Halo2ConstraintModel;
export declare function normalizeHalo2Column(value?: string): string | undefined;
