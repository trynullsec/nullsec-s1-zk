import { Halo2ConstraintGraph } from "../../frontends/halo2/halo2-constraint-graph.js";
export function hasHalo2(context) {
    return Boolean(context.halo2 && context.halo2.files.length > 0);
}
export function assignmentIsConstrained(assignment, context) {
    if (!context.halo2)
        return false;
    return new Halo2ConstraintGraph(context.halo2).isAssignmentConnected(assignment);
}
export function columnHasEqualityEnabled(columnName, context) {
    if (!context.halo2)
        return false;
    return new Halo2ConstraintGraph(context.halo2).columnHasEqualityEnabled(columnName);
}
export function halo2Graph(context) {
    return context.halo2 ? new Halo2ConstraintGraph(context.halo2) : undefined;
}
export function fileHasSafeInverseGuard(file, line, context) {
    const source = context.halo2?.files.find((candidate) => candidate.filePath === file)?.rawSource ?? "";
    const lines = source.split(/\r?\n/);
    const window = lines.slice(Math.max(0, line - 6), Math.min(lines.length, line + 5)).join("\n");
    return /\bis_zero\b|\bnonzero\b|\bnot_zero\b|\bassert(?:!|\s*\()|\bsafe\b|\bchecked\b|\bconstrain_equal\b|\bzero_check\b/i.test(window);
}
//# sourceMappingURL=halo2-rule-utils.js.map