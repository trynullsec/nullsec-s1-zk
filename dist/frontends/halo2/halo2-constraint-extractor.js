function normalizeColumn(value) {
    return value?.trim().replace(/^config\./, "").replace(/^self\./, "").split(".").pop();
}
export function extractHalo2ConstraintModel(ir) {
    const gates = ir.gates.map((gate) => ({
        gate,
        selectorColumns: Object.values(gate.selectorAliases ?? {}).map(normalizeColumn).filter((value) => Boolean(value)),
        adviceColumns: Object.values(gate.adviceAliases ?? {}).map(normalizeColumn).filter((value) => Boolean(value)),
        instanceColumns: Object.values(gate.instanceAliases ?? {}).map(normalizeColumn).filter((value) => Boolean(value)),
        fixedColumns: Object.values(gate.fixedAliases ?? {}).map(normalizeColumn).filter((value) => Boolean(value)),
        expressions: gate.returnedExpressions ?? gate.expressions,
        variableReferences: gate.variableReferences ?? []
    }));
    const assignments = ir.assignments.map((assignment, index) => {
        const region = ir.regions.find((candidate) => candidate.file === assignment.file && assignment.line >= candidate.line && candidate.assignments.includes(assignment));
        return {
            id: `${assignment.file}:${assignment.line}:${index}`,
            assignment,
            columnName: normalizeColumn(assignment.columnName ?? assignment.target),
            label: assignment.label,
            cellVariable: assignment.cellVariable,
            region,
            connectedBy: []
        };
    });
    return {
        gates,
        assignments,
        selectors: ir.selectors,
        instanceQueries: ir.queries.filter((query) => query.queryType === "instance"),
        instanceBindings: ir.instanceConstraints,
        lookups: ir.lookups
    };
}
export function normalizeHalo2Column(value) {
    return normalizeColumn(value);
}
//# sourceMappingURL=halo2-constraint-extractor.js.map