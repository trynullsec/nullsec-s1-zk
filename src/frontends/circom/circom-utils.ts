const reserved = new Set([
  "signal",
  "input",
  "output",
  "component",
  "template",
  "pragma",
  "include",
  "assert",
  "var",
  "for",
  "if",
  "else",
  "return",
  "public",
  "private",
  "main",
  "true",
  "false"
]);

export function normalizeSignalReference(reference: string): string {
  return reference.trim().replace(/\s+/g, "").replace(/\[[^\]]+\]/g, "[]");
}

export function baseSignalName(reference: string): string {
  const normalized = normalizeSignalReference(reference);
  return normalized.split(/[.\[]/)[0] ?? normalized;
}

export function extractSignalReferences(expression: string): string[] {
  const refs = new Set<string>();
  const pattern = /\b[A-Za-z_][A-Za-z0-9_]*(?:\s*(?:\[[^\]]+\]|\.[A-Za-z_][A-Za-z0-9_]*))*\b/g;
  for (const match of expression.matchAll(pattern)) {
    const value = normalizeSignalReference(match[0]);
    const root = value.split(".")[0]?.replace(/\[\]/g, "") ?? value;
    if (!reserved.has(root) && !/^\d+$/.test(root)) refs.add(value);
  }
  return [...refs];
}

export function isBooleanLikeName(name: string): boolean {
  const lower = name.toLowerCase();
  const exactOrSuffix = ["enabled", "flag", "bool", "valid", "verified", "admin", "approved", "allowed", "selector", "direction", "bit", "pathindex", "path_index"].some(
    (token) => lower === token || lower.endsWith(`_${token}`) || lower.endsWith(token)
  );
  return (
    /^is[A-Z_]/.test(name) ||
    /^has[A-Z_]/.test(name) ||
    /^should[A-Z_]/.test(name) ||
    /^can[A-Z_]/.test(name) ||
    exactOrSuffix
  );
}

export function isSelectorLikeName(name: string): boolean {
  const lower = name.toLowerCase();
  return ["selector", "select", "enabled", "flag", "direction", "pathindex", "isleft", "isright", "choose", "switch"].some((token) =>
    lower.includes(token)
  );
}

export function isNumericLikeName(name: string): boolean {
  const lower = name.toLowerCase();
  return [
    "amount",
    "balance",
    "fee",
    "nonce",
    "index",
    "idx",
    "id",
    "timestamp",
    "price",
    "quantity",
    "value",
    "limb",
    "total",
    "count",
    "size",
    "length",
    "depth",
    "level",
    "nullifier",
    "asset",
    "token"
  ].some((token) => lower.includes(token));
}

export function isHighValueNumericName(name: string): boolean {
  const lower = name.toLowerCase();
  return ["amount", "balance", "fee", "nonce", "nullifier", "commitment", "root", "limb"].some((token) => lower.includes(token));
}

export function expressionHasDivisionOrInverse(expression: string): boolean {
  return /\/|\binv(?:erse)?\b|\bIsZero\b/i.test(expression);
}

export function expressionHasHashContext(expression: string): boolean {
  return /poseidon|pedersen|mimc|hash|commitment|nullifier|root/i.test(expression);
}
