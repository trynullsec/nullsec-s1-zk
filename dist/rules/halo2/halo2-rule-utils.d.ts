import type { AuditContext } from "../../types.js";
import type { Halo2Assignment } from "../../frontends/halo2/halo2-types.js";
import { Halo2ConstraintGraph } from "../../frontends/halo2/halo2-constraint-graph.js";
export declare function hasHalo2(context: AuditContext): boolean;
export declare function assignmentIsConstrained(assignment: Halo2Assignment, context: AuditContext): boolean;
export declare function columnHasEqualityEnabled(columnName: string, context: AuditContext): boolean;
export declare function halo2Graph(context: AuditContext): Halo2ConstraintGraph | undefined;
export declare function fileHasSafeInverseGuard(file: string, line: number, context: AuditContext): boolean;
