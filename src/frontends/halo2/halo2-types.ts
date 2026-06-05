import type { ParserWarning, SourceLocation } from "../../types.js";

export interface Halo2Column extends SourceLocation {
  name: string;
  columnType: "advice" | "fixed" | "instance" | "unknown";
  equalityEnabled: boolean;
}

export interface Halo2Selector extends SourceLocation {
  name: string;
  enabledLines: number[];
  usedInGates: string[];
}

export interface Halo2Query extends SourceLocation {
  queryType: "advice" | "fixed" | "instance" | "selector";
  columnName: string;
  rotation?: string;
  gateName?: string;
}

export interface Halo2Gate extends SourceLocation {
  name: string;
  body: string;
  queries: Halo2Query[];
  selectors: string[];
  expressions: string[];
  returnedExpressions?: string[];
  variableReferences?: string[];
  selectorAliases?: Record<string, string>;
  adviceAliases?: Record<string, string>;
  instanceAliases?: Record<string, string>;
  fixedAliases?: Record<string, string>;
}

export interface Halo2Assignment extends SourceLocation {
  assignmentType: "advice" | "fixed";
  target?: string;
  columnName?: string;
  label?: string;
  rowOffset?: string;
  assignedVariable?: string;
  cellVariable?: string;
  regionName?: string;
  expression: string;
  referencedSymbols: string[];
}

export interface Halo2EqualityConstraint extends SourceLocation {
  lhs: string;
  rhs: string;
  referencedColumns: string[];
}

export interface Halo2InstanceConstraint extends SourceLocation {
  cell: string;
  instanceColumn: string;
  row?: string;
}

export interface Halo2Lookup extends SourceLocation {
  expression: string;
  referencedSymbols: string[];
}

export interface Halo2Region extends SourceLocation {
  name: string;
  assignments: Halo2Assignment[];
  selectorEnables: string[];
  copyAdvice: Halo2CopyConstraint[];
  equalityConstraints: Halo2EqualityConstraint[];
  instanceConstraints: Halo2InstanceConstraint[];
}

export interface Halo2CopyConstraint extends SourceLocation {
  source: string;
  targetColumn?: string;
  targetOffset?: string;
  referencedSymbols: string[];
}

export interface Halo2CircuitFile {
  filePath: string;
  rawSource: string;
  columns: Halo2Column[];
  selectors: Halo2Selector[];
  gates: Halo2Gate[];
  queries: Halo2Query[];
  assignments: Halo2Assignment[];
  equalityConstraints: Halo2EqualityConstraint[];
  instanceConstraints: Halo2InstanceConstraint[];
  lookups: Halo2Lookup[];
  regions: Halo2Region[];
  copyConstraints: Halo2CopyConstraint[];
  parserWarnings: ParserWarning[];
  detectedPatterns: string[];
}

export interface Halo2IR {
  files: Halo2CircuitFile[];
  columns: Halo2Column[];
  selectors: Halo2Selector[];
  gates: Halo2Gate[];
  queries: Halo2Query[];
  assignments: Halo2Assignment[];
  equalityConstraints: Halo2EqualityConstraint[];
  instanceConstraints: Halo2InstanceConstraint[];
  lookups: Halo2Lookup[];
  regions: Halo2Region[];
  copyConstraints: Halo2CopyConstraint[];
  parserWarnings: ParserWarning[];
}
