import { columnOf, getLine } from "../../core/source-map.js";
import type {
  Halo2Assignment,
  Halo2CircuitFile,
  Halo2Column,
  Halo2CopyConstraint,
  Halo2EqualityConstraint,
  Halo2Gate,
  Halo2InstanceConstraint,
  Halo2Lookup,
  Halo2Query,
  Halo2Region,
  Halo2Selector
} from "./halo2-types.js";
import { extractRustSymbols, halo2DetectionPatterns, isLikelyHalo2Source } from "./halo2-patterns.js";
import { parseHalo2GateExpression } from "./halo2-expression-parser.js";
import type { ParserWarning } from "../../types.js";

interface Block {
  text: string;
  startLine: number;
  endLine: number;
  snippet: string;
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split(/\r?\n/).length;
}

function findBalancedBlock(source: string, startIndex: number): Block | undefined {
  const open = source.indexOf("{", startIndex);
  if (open < 0) return undefined;
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth === 0) {
      const startLine = lineNumberAt(source, startIndex);
      return {
        text: source.slice(open + 1, i),
        startLine,
        endLine: lineNumberAt(source, i),
        snippet: getLine(source, startLine).trim()
      };
    }
  }
  return undefined;
}

function extractGateName(prefix: string): string {
  const quoted = prefix.match(/create_gate\s*\(\s*"([^"]+)"/);
  return quoted?.[1] ?? "unnamed gate";
}

function extractQueries(filePath: string, source: string, gateName?: string, lineOffset = 0): Halo2Query[] {
  const queries: Halo2Query[] = [];
  const regex = /query_(advice|fixed|instance|selector)\s*\(([^)]*)\)/g;
  for (const match of source.matchAll(regex)) {
    const queryType = match[1] as Halo2Query["queryType"];
    const args = (match[2] ?? "").split(",").map((arg) => arg.trim());
    const line = lineOffset + lineNumberAt(source, match.index ?? 0);
    queries.push({
      queryType,
      columnName: args[0] ?? "unknown",
      rotation: args[1],
      gateName,
      file: filePath,
      line,
      column: columnOf(getLine(source, line - lineOffset), match[0] ?? ""),
      snippet: getLine(source, line - lineOffset).trim()
    });
  }
  return queries;
}

function extractColumns(filePath: string, rawSource: string): Halo2Column[] {
  const columns: Halo2Column[] = [];
  const lines = rawSource.split(/\r?\n/);
  const regex = /(?:let\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:meta\.)?(advice_column|fixed_column|instance_column)\s*\(/;
  lines.forEach((lineText, index) => {
    const match = lineText.match(regex);
    if (!match) return;
    const kind = match[2] === "advice_column" ? "advice" : match[2] === "fixed_column" ? "fixed" : "instance";
    const name = match[1] ?? "unknown";
    const equalityEnabled = new RegExp(`enable_equality\\s*\\(\\s*${name}\\s*\\)`).test(rawSource);
    columns.push({
      name,
      columnType: kind,
      equalityEnabled,
      file: filePath,
      line: index + 1,
      column: columnOf(lineText, name),
      snippet: lineText.trim()
    });
  });
  return columns;
}

function extractSelectors(filePath: string, rawSource: string, gates: Halo2Gate[]): Halo2Selector[] {
  const selectors = new Map<string, Halo2Selector>();
  const lines = rawSource.split(/\r?\n/);
  lines.forEach((lineText, index) => {
    const construct = lineText.match(/(?:let\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:meta\.)?(selector|complex_selector)\s*\(/);
    const typed = lineText.match(/([A-Za-z_][A-Za-z0-9_]*)\s*:\s*Selector\b/);
    const match = construct ?? typed;
    if (!match) return;
    const name = match[1] ?? "selector";
    selectors.set(name, {
      name,
      enabledLines: [],
      usedInGates: [],
      file: filePath,
      line: index + 1,
      column: columnOf(lineText, name),
      snippet: lineText.trim()
    });
  });

  for (const gate of gates) {
    for (const selector of gate.selectors) {
      const existing =
        selectors.get(selector) ??
        ({
          name: selector,
          enabledLines: [],
          usedInGates: [],
          file: filePath,
          line: gate.line,
          column: gate.column,
          snippet: gate.snippet
        } satisfies Halo2Selector);
      existing.usedInGates.push(gate.name);
      selectors.set(selector, existing);
    }
  }

  lines.forEach((lineText, index) => {
    const enable = lineText.match(/([A-Za-z_][A-Za-z0-9_.]*)\.enable\s*\(/);
    if (!enable) return;
    const name = (enable[1] ?? "").split(".").pop() ?? enable[1] ?? "";
    const existing =
      selectors.get(name) ??
      ({
        name,
        enabledLines: [],
        usedInGates: [],
        file: filePath,
        line: index + 1,
        column: columnOf(lineText, name),
        snippet: lineText.trim()
      } satisfies Halo2Selector);
    existing.enabledLines.push(index + 1);
    selectors.set(name, existing);
  });

  return [...selectors.values()];
}

function extractGates(filePath: string, rawSource: string): Halo2Gate[] {
  const gates: Halo2Gate[] = [];
  const regex = /create_gate\s*\(/g;
  for (const match of rawSource.matchAll(regex)) {
    const start = match.index ?? 0;
    const block = findBalancedBlock(rawSource, start);
    if (!block) continue;
    const prefix = rawSource.slice(start, rawSource.indexOf("{", start));
    const name = extractGateName(prefix);
    const queries = extractQueries(filePath, block.text, name, block.startLine - 1);
    const parsedExpression = parseHalo2GateExpression(block.text);
    gates.push({
      name,
      body: block.text,
      queries,
      selectors: queries.filter((query) => query.queryType === "selector").map((query) => query.columnName),
      expressions: block.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      returnedExpressions: parsedExpression.returnedExpressions,
      variableReferences: parsedExpression.variableReferences,
      selectorAliases: parsedExpression.selectorAliases,
      adviceAliases: parsedExpression.adviceAliases,
      instanceAliases: parsedExpression.instanceAliases,
      fixedAliases: parsedExpression.fixedAliases,
      file: filePath,
      line: block.startLine,
      column: 1,
      snippet: block.snippet
    });
  }
  return gates;
}

function extractAssignments(filePath: string, rawSource: string): Halo2Assignment[] {
  const assignments: Halo2Assignment[] = [];
  rawSource.split(/\r?\n/).forEach((lineText, index) => {
    const match = lineText.match(/\b(assign_advice|assign_fixed)\s*\((.*)/);
    if (!match) return;
    const label = lineText.match(/\|\|\s*"([^"]+)"/)?.[1];
    const args = lineText.split(",");
    const columnName = args.find((arg) => /config\.|\.advice|\.fixed|[A-Za-z_][A-Za-z0-9_]*\./.test(arg))?.trim();
    const rowOffset = args.find((arg) => /^\s*\d+\s*$/.test(arg))?.trim();
    const cellVariable = lineText.match(/(?:let\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*.*assign_(?:advice|fixed)/)?.[1];
    assignments.push({
      assignmentType: match[1] === "assign_advice" ? "advice" : "fixed",
      target: columnName,
      columnName,
      label,
      rowOffset,
      cellVariable,
      assignedVariable: lineText.match(/Value::known\s*\(([^)]+)\)/)?.[1]?.trim(),
      expression: lineText.trim(),
      referencedSymbols: extractRustSymbols(lineText),
      file: filePath,
      line: index + 1,
      column: columnOf(lineText, match[1] ?? "assign"),
      snippet: lineText.trim()
    });
  });
  return assignments;
}

function extractCopyConstraints(filePath: string, rawSource: string): Halo2CopyConstraint[] {
  return rawSource
    .split(/\r?\n/)
    .map((lineText, index) => ({ lineText, index }))
    .filter(({ lineText }) => /\.copy_advice\s*\(/.test(lineText))
    .map(({ lineText, index }) => ({
      source: lineText.match(/([A-Za-z_][A-Za-z0-9_.]*)\.copy_advice/)?.[1] ?? "unknown",
      targetColumn: lineText.split(",").find((part) => /config\.|\.advice|\.fixed|\.instance/.test(part))?.trim(),
      targetOffset: lineText.split(",").find((part) => /^\s*\d+\s*\)/.test(part))?.replace(/\D/g, ""),
      referencedSymbols: extractRustSymbols(lineText),
      file: filePath,
      line: index + 1,
      column: columnOf(lineText, "copy_advice"),
      snippet: lineText.trim()
    }));
}

function extractConstraints(filePath: string, rawSource: string): {
  equalityConstraints: Halo2EqualityConstraint[];
  instanceConstraints: Halo2InstanceConstraint[];
} {
  const equalityConstraints: Halo2EqualityConstraint[] = [];
  const instanceConstraints: Halo2InstanceConstraint[] = [];
  rawSource.split(/\r?\n/).forEach((lineText, index) => {
    const equal = lineText.match(/\bconstrain_equal\s*\(([^,]+),\s*([^)]+)\)/);
    if (equal) {
      equalityConstraints.push({
        lhs: (equal[1] ?? "").trim(),
        rhs: (equal[2] ?? "").trim(),
        referencedColumns: extractRustSymbols(lineText),
        file: filePath,
        line: index + 1,
        column: columnOf(lineText, "constrain_equal"),
        snippet: lineText.trim()
      });
    }
    const instance = lineText.match(/\bconstrain_instance\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    if (instance) {
      instanceConstraints.push({
        cell: (instance[1] ?? "").trim(),
        instanceColumn: (instance[2] ?? "").trim(),
        row: (instance[3] ?? "").trim(),
        file: filePath,
        line: index + 1,
        column: columnOf(lineText, "constrain_instance"),
        snippet: lineText.trim()
      });
    }
  });
  return { equalityConstraints, instanceConstraints };
}

function extractLookups(filePath: string, rawSource: string): Halo2Lookup[] {
  return rawSource
    .split(/\r?\n/)
    .map((lineText, index) => ({ lineText, index }))
    .filter(({ lineText }) => /\.lookup\b|create_lookup|lookup_any|lookup_table_column/.test(lineText))
    .map(({ lineText, index }) => ({
      expression: lineText.trim(),
      referencedSymbols: extractRustSymbols(lineText),
      file: filePath,
      line: index + 1,
      column: columnOf(lineText, "lookup"),
      snippet: lineText.trim()
    }));
}

function extractRegions(
  filePath: string,
  rawSource: string,
  assignments: Halo2Assignment[],
  equalityConstraints: Halo2EqualityConstraint[],
  instanceConstraints: Halo2InstanceConstraint[],
  copyConstraints: Halo2CopyConstraint[]
): Halo2Region[] {
  const regions: Halo2Region[] = [];
  const regex = /assign_region\s*\(\s*\|\|\s*"([^"]+)"/g;
  for (const match of rawSource.matchAll(regex)) {
    const start = match.index ?? 0;
    const block = findBalancedBlock(rawSource, start);
    const line = lineNumberAt(rawSource, start);
    const endLine = block?.endLine ?? line;
    regions.push({
      name: match[1] ?? "region",
      assignments: assignments.filter((assignment) => assignment.line >= line && assignment.line <= endLine),
      selectorEnables: (block?.text.match(/([A-Za-z_][A-Za-z0-9_.]*)\.enable\s*\(/g) ?? []).map((value) => value.split(".").at(-2) ?? value),
      copyAdvice: copyConstraints.filter((constraint) => constraint.line >= line && constraint.line <= endLine),
      equalityConstraints: equalityConstraints.filter((constraint) => constraint.line >= line && constraint.line <= endLine),
      instanceConstraints: instanceConstraints.filter((constraint) => constraint.line >= line && constraint.line <= endLine),
      file: filePath,
      line,
      column: 1,
      snippet: getLine(rawSource, line).trim()
    });
  }
  return regions;
}

export function parseHalo2File(filePath: string, rawSource: string): Halo2CircuitFile {
  const parserWarnings: ParserWarning[] = [];
  const detectedPatterns = halo2DetectionPatterns.filter((pattern) => rawSource.includes(pattern));
  if (!isLikelyHalo2Source(rawSource)) {
    parserWarnings.push({
      message: "Rust file does not contain known Halo2 patterns; parsed with low confidence.",
      file: filePath,
      line: 1,
      column: 1,
      snippet: getLine(rawSource, 1)
    });
  }

  const gates = extractGates(filePath, rawSource);
  const queries = [...extractQueries(filePath, rawSource), ...gates.flatMap((gate) => gate.queries)];
  const columns = extractColumns(filePath, rawSource);
  const assignments = extractAssignments(filePath, rawSource);
  const { equalityConstraints, instanceConstraints } = extractConstraints(filePath, rawSource);
  const copyConstraints = extractCopyConstraints(filePath, rawSource);
  const lookups = extractLookups(filePath, rawSource);
  const regions = extractRegions(filePath, rawSource, assignments, equalityConstraints, instanceConstraints, copyConstraints);
  const selectors = extractSelectors(filePath, rawSource, gates);

  return {
    filePath,
    rawSource,
    columns,
    selectors,
    gates,
    queries,
    assignments,
    equalityConstraints,
    instanceConstraints,
    lookups,
    regions,
    copyConstraints,
    parserWarnings,
    detectedPatterns
  };
}
