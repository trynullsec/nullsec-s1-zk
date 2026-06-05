import { expressionUsesAliasAsMultiplier } from "./halo2-expression-parser.js";
import { extractHalo2ConstraintModel, normalizeHalo2Column } from "./halo2-constraint-extractor.js";
function includesToken(text, token) {
    if (!text || !token)
        return false;
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^A-Za-z0-9_])${escaped}([^A-Za-z0-9_]|$)`).test(text);
}
function assignmentTokens(node) {
    return [
        node.columnName,
        node.label,
        node.cellVariable,
        node.assignment.assignedVariable,
        node.assignment.target,
        ...node.assignment.referencedSymbols
    ].filter((value) => Boolean(value));
}
export class Halo2ConstraintGraph {
    ir;
    model;
    constructor(ir) {
        this.ir = ir;
        this.model = extractHalo2ConstraintModel(ir);
    }
    assignmentNode(assignment) {
        return this.model.assignments.find((node) => node.assignment === assignment);
    }
    gatesForColumn(columnName) {
        const normalized = normalizeHalo2Column(columnName);
        if (!normalized)
            return [];
        return this.model.gates.filter((gate) => gate.adviceColumns.includes(normalized) || gate.instanceColumns.includes(normalized)).map((gate) => gate.gate.name);
    }
    isAssignmentConnected(assignment) {
        return this.assignmentConnections(assignment).length > 0;
    }
    assignmentConnections(assignment) {
        const node = this.assignmentNode(assignment);
        if (!node)
            return [];
        const tokens = assignmentTokens(node);
        const connections = new Set();
        const columnGates = this.gatesForColumn(node.columnName);
        for (const gateName of columnGates)
            connections.add(`gate:${gateName}`);
        for (const gate of this.model.gates.filter((candidate) => candidate.gate.file === assignment.file)) {
            if (tokens.some((token) => gate.expressions.some((expression) => includesToken(expression, token))))
                connections.add(`gate-expression:${gate.gate.name}`);
        }
        for (const eq of this.ir.equalityConstraints.filter((constraint) => constraint.file === assignment.file)) {
            if (tokens.some((token) => includesToken(eq.snippet, token)))
                connections.add("equality");
        }
        for (const copy of this.ir.copyConstraints.filter((constraint) => constraint.file === assignment.file)) {
            if (tokens.some((token) => includesToken(copy.snippet, token)))
                connections.add("copy");
        }
        for (const binding of this.model.instanceBindings.filter((constraint) => constraint.file === assignment.file)) {
            if (tokens.some((token) => includesToken(binding.snippet, token)))
                connections.add("instance");
        }
        for (const lookup of this.model.lookups.filter((candidate) => candidate.file === assignment.file)) {
            if (tokens.some((token) => includesToken(lookup.expression, token)))
                connections.add("lookup");
        }
        return [...connections];
    }
    selectorEnabled(selectorName) {
        const normalized = normalizeHalo2Column(selectorName) ?? selectorName;
        return this.ir.selectors.some((selector) => (selector.name === normalized || normalizeHalo2Column(selector.name) === normalized) && selector.enabledLines.length > 0);
    }
    selectorUsedAsGateMultiplier(selectorName) {
        const normalized = normalizeHalo2Column(selectorName) ?? selectorName;
        return this.model.gates.some((gate) => {
            const aliases = Object.entries(gate.gate.selectorAliases ?? {}).filter(([, column]) => normalizeHalo2Column(column) === normalized).map(([alias]) => alias);
            return aliases.some((alias) => gate.expressions.some((expression) => expressionUsesAliasAsMultiplier(expression, alias)));
        });
    }
    instanceQueryIsBound(queryColumnName, file) {
        const normalized = normalizeHalo2Column(queryColumnName) ?? queryColumnName;
        const queriedInGate = this.model.gates.some((gate) => gate.gate.file === file && gate.instanceColumns.includes(normalized));
        const exposed = this.model.instanceBindings.some((binding) => binding.file === file && includesToken(binding.snippet, normalized));
        return queriedInGate || exposed;
    }
    columnHasEqualityEnabled(columnName) {
        const normalized = normalizeHalo2Column(columnName);
        if (!normalized)
            return false;
        return this.ir.columns.some((column) => normalizeHalo2Column(column.name) === normalized && column.equalityEnabled);
    }
    equalityConstraintHasEnabledColumn(snippet) {
        return this.ir.columns.some((column) => column.equalityEnabled && includesToken(snippet, column.name));
    }
}
//# sourceMappingURL=halo2-constraint-graph.js.map