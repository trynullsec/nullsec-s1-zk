import { extractRustSymbols } from "./halo2-patterns.js";

export interface Halo2ParsedGateExpression {
  returnedExpressions: string[];
  variableReferences: string[];
  selectorAliases: Record<string, string>;
  adviceAliases: Record<string, string>;
  instanceAliases: Record<string, string>;
  fixedAliases: Record<string, string>;
  rotations: Array<{ alias: string; rotation: "cur" | "prev" | "next" | string }>;
}

function normalizeColumn(value: string): string {
  return value.trim().replace(/^config\./, "").replace(/^self\./, "");
}

function extractVecExpressions(body: string): string[] {
  const vecMatch = body.match(/vec!\s*\[([\s\S]*?)\]\s*;?/);
  if (!vecMatch) return [];
  const inner = vecMatch[1] ?? "";
  const expressions: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of inner) {
    if (ch === "(" || ch === "[" || ch === "{") depth += 1;
    if (ch === ")" || ch === "]" || ch === "}") depth -= 1;
    if (ch === "," && depth === 0) {
      if (current.trim()) expressions.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) expressions.push(current.trim());
  return expressions;
}

export function parseHalo2GateExpression(body: string): Halo2ParsedGateExpression {
  const selectorAliases: Record<string, string> = {};
  const adviceAliases: Record<string, string> = {};
  const instanceAliases: Record<string, string> = {};
  const fixedAliases: Record<string, string> = {};
  const rotations: Halo2ParsedGateExpression["rotations"] = [];

  const queryPattern = /let\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*meta\.query_(advice|instance|fixed|selector)\s*\(([^)]*)\)/g;
  for (const match of body.matchAll(queryPattern)) {
    const alias = match[1] ?? "unknown";
    const queryType = match[2] ?? "unknown";
    const args = (match[3] ?? "").split(",").map((arg) => arg.trim());
    const columnName = normalizeColumn(args[0] ?? "unknown");
    const rotation = args.find((arg) => /Rotation::/.test(arg))?.match(/Rotation::([A-Za-z_][A-Za-z0-9_]*)/)?.[1] ?? "cur";
    if (queryType === "selector") selectorAliases[alias] = columnName;
    if (queryType === "advice") adviceAliases[alias] = columnName;
    if (queryType === "instance") instanceAliases[alias] = columnName;
    if (queryType === "fixed") fixedAliases[alias] = columnName;
    if (queryType !== "selector") rotations.push({ alias, rotation });
  }

  const returnedExpressions = extractVecExpressions(body);
  const variableReferences = [...new Set(returnedExpressions.flatMap((expression) => extractRustSymbols(expression)))];
  return { returnedExpressions, variableReferences, selectorAliases, adviceAliases, instanceAliases, fixedAliases, rotations };
}

export function expressionUsesAliasAsMultiplier(expression: string, alias: string): boolean {
  const compact = expression.replace(/\s+/g, "");
  return compact.includes(`${alias}*`) || compact.includes(`*${alias}`);
}
