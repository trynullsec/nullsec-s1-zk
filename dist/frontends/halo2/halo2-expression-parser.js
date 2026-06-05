import { extractRustSymbols } from "./halo2-patterns.js";
function normalizeColumn(value) {
    return value.trim().replace(/^config\./, "").replace(/^self\./, "");
}
function extractVecExpressions(body) {
    const vecMatch = body.match(/vec!\s*\[([\s\S]*?)\]\s*;?/);
    if (!vecMatch)
        return [];
    const inner = vecMatch[1] ?? "";
    const expressions = [];
    let depth = 0;
    let current = "";
    for (const ch of inner) {
        if (ch === "(" || ch === "[" || ch === "{")
            depth += 1;
        if (ch === ")" || ch === "]" || ch === "}")
            depth -= 1;
        if (ch === "," && depth === 0) {
            if (current.trim())
                expressions.push(current.trim());
            current = "";
            continue;
        }
        current += ch;
    }
    if (current.trim())
        expressions.push(current.trim());
    return expressions;
}
export function parseHalo2GateExpression(body) {
    const selectorAliases = {};
    const adviceAliases = {};
    const instanceAliases = {};
    const fixedAliases = {};
    const rotations = [];
    const queryPattern = /let\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*meta\.query_(advice|instance|fixed|selector)\s*\(([^)]*)\)/g;
    for (const match of body.matchAll(queryPattern)) {
        const alias = match[1] ?? "unknown";
        const queryType = match[2] ?? "unknown";
        const args = (match[3] ?? "").split(",").map((arg) => arg.trim());
        const columnName = normalizeColumn(args[0] ?? "unknown");
        const rotation = args.find((arg) => /Rotation::/.test(arg))?.match(/Rotation::([A-Za-z_][A-Za-z0-9_]*)/)?.[1] ?? "cur";
        if (queryType === "selector")
            selectorAliases[alias] = columnName;
        if (queryType === "advice")
            adviceAliases[alias] = columnName;
        if (queryType === "instance")
            instanceAliases[alias] = columnName;
        if (queryType === "fixed")
            fixedAliases[alias] = columnName;
        if (queryType !== "selector")
            rotations.push({ alias, rotation });
    }
    const returnedExpressions = extractVecExpressions(body);
    const variableReferences = [...new Set(returnedExpressions.flatMap((expression) => extractRustSymbols(expression)))];
    return { returnedExpressions, variableReferences, selectorAliases, adviceAliases, instanceAliases, fixedAliases, rotations };
}
export function expressionUsesAliasAsMultiplier(expression, alias) {
    const compact = expression.replace(/\s+/g, "");
    return compact.includes(`${alias}*`) || compact.includes(`*${alias}`);
}
//# sourceMappingURL=halo2-expression-parser.js.map