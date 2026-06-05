import { type Halo2AssignmentNode, type Halo2ConstraintModel } from "./halo2-constraint-extractor.js";
import type { Halo2Assignment, Halo2IR } from "./halo2-types.js";
export declare class Halo2ConstraintGraph {
    readonly ir: Halo2IR;
    readonly model: Halo2ConstraintModel;
    constructor(ir: Halo2IR);
    assignmentNode(assignment: Halo2Assignment): Halo2AssignmentNode | undefined;
    gatesForColumn(columnName: string | undefined): string[];
    isAssignmentConnected(assignment: Halo2Assignment): boolean;
    assignmentConnections(assignment: Halo2Assignment): string[];
    selectorEnabled(selectorName: string): boolean;
    selectorUsedAsGateMultiplier(selectorName: string): boolean;
    instanceQueryIsBound(queryColumnName: string, file: string): boolean;
    columnHasEqualityEnabled(columnName: string | undefined): boolean;
    equalityConstraintHasEnabledColumn(snippet: string | undefined): boolean;
}
