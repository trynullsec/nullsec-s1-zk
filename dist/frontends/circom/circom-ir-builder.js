export function buildCircuitIR(files) {
    return {
        files,
        signals: files.flatMap((file) => file.signals),
        components: files.flatMap((file) => file.components),
        assignments: files.flatMap((file) => file.assignments),
        constraints: files.flatMap((file) => file.constraints),
        assertions: files.flatMap((file) => file.assertions),
        parserWarnings: files.flatMap((file) => file.parserWarnings)
    };
}
//# sourceMappingURL=circom-ir-builder.js.map