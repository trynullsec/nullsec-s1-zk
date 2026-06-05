import type { AuditContext } from "../../types.js";
import type { Halo2Assignment } from "../../frontends/halo2/halo2-types.js";
import { Halo2ConstraintGraph } from "../../frontends/halo2/halo2-constraint-graph.js";

export function hasHalo2(context: AuditContext): boolean {
  return Boolean(context.halo2 && context.halo2.files.length > 0);
}

export function assignmentIsConstrained(assignment: Halo2Assignment, context: AuditContext): boolean {
  if (!context.halo2) return false;
  return new Halo2ConstraintGraph(context.halo2).isAssignmentConnected(assignment);
}

export function columnHasEqualityEnabled(columnName: string, context: AuditContext): boolean {
  if (!context.halo2) return false;
  return new Halo2ConstraintGraph(context.halo2).columnHasEqualityEnabled(columnName);
}

export function halo2Graph(context: AuditContext): Halo2ConstraintGraph | undefined {
  return context.halo2 ? new Halo2ConstraintGraph(context.halo2) : undefined;
}

export function fileHasSafeInverseGuard(file: string, line: number, context: AuditContext): boolean {
  const source = context.halo2?.files.find((candidate) => candidate.filePath === file)?.rawSource ?? "";
  const lines = source.split(/\r?\n/);
  const window = lines.slice(Math.max(0, line - 6), Math.min(lines.length, line + 5)).join("\n");
  return /\bis_zero\b|\bnonzero\b|\bnot_zero\b|\bassert(?:!|\s*\()|\bsafe\b|\bchecked\b|\bconstrain_equal\b|\bzero_check\b/i.test(window);
}
