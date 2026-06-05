export function buildHalo2IR(files) {
    return {
        files,
        columns: files.flatMap((file) => file.columns),
        selectors: files.flatMap((file) => file.selectors),
        gates: files.flatMap((file) => file.gates),
        queries: files.flatMap((file) => file.queries),
        assignments: files.flatMap((file) => file.assignments),
        equalityConstraints: files.flatMap((file) => file.equalityConstraints),
        instanceConstraints: files.flatMap((file) => file.instanceConstraints),
        lookups: files.flatMap((file) => file.lookups),
        regions: files.flatMap((file) => file.regions),
        copyConstraints: files.flatMap((file) => file.copyConstraints),
        parserWarnings: files.flatMap((file) => file.parserWarnings)
    };
}
//# sourceMappingURL=halo2-ir-builder.js.map