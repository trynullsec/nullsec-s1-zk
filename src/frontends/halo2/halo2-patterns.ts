export const halo2DetectionPatterns = [
  "halo2_proofs",
  "ConstraintSystem",
  "create_gate",
  "query_advice",
  "query_instance",
  "assign_advice",
  "constrain_equal",
  "constrain_instance",
  "enable_equality",
  "Selector",
  "Advice",
  "Instance",
  "Fixed"
];

export const halo2DetectionRegex = new RegExp(halo2DetectionPatterns.join("|"));

export function isLikelyHalo2Source(source: string): boolean {
  return halo2DetectionRegex.test(source);
}

export function extractRustSymbols(expression: string): string[] {
  const reserved = new Set([
    "self",
    "meta",
    "region",
    "layouter",
    "Value",
    "Rotation",
    "cur",
    "prev",
    "next",
    "Ok",
    "Err",
    "Some",
    "None",
    "let",
    "mut",
    "move",
    "return",
    "assign_advice",
    "assign_fixed",
    "constrain_equal",
    "constrain_instance",
    "enable_selector"
  ]);
  const matches = expression.match(/\b[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*\b/g) ?? [];
  return [...new Set(matches.filter((symbol) => !reserved.has(symbol.split(".")[0] ?? symbol) && !/^\d+$/.test(symbol)))];
}

export function isHashOrSafeInverseContext(snippet: string): boolean {
  return /is_zero|nonzero|not_zero|checked|safe|assert|constrain_equal|zero_check/i.test(snippet);
}

export function isEcLikeName(value: string): boolean {
  return /curve|point|scalar|base|fixed_base|variable_base|ecc|ec_|mul|window|endo/i.test(value);
}
