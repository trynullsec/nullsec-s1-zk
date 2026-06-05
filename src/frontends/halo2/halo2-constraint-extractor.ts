import type {
  Halo2Assignment,
  Halo2Gate,
  Halo2IR,
  Halo2InstanceConstraint,
  Halo2Lookup,
  Halo2Query,
  Halo2Region,
  Halo2Selector
} from "./halo2-types.js";

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

function normalizeColumn(value?: string): string | undefined {
  return value?.trim().replace(/^config\./, "").replace(/^self\./, "").split(".").pop();
}

export function extractHalo2ConstraintModel(ir: Halo2IR): Halo2ConstraintModel {
  const gates = ir.gates.map((gate) => ({
    gate,
    selectorColumns: Object.values(gate.selectorAliases ?? {}).map(normalizeColumn).filter((value): value is string => Boolean(value)),
    adviceColumns: Object.values(gate.adviceAliases ?? {}).map(normalizeColumn).filter((value): value is string => Boolean(value)),
    instanceColumns: Object.values(gate.instanceAliases ?? {}).map(normalizeColumn).filter((value): value is string => Boolean(value)),
    fixedColumns: Object.values(gate.fixedAliases ?? {}).map(normalizeColumn).filter((value): value is string => Boolean(value)),
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

export function normalizeHalo2Column(value?: string): string | undefined {
  return normalizeColumn(value);
}
