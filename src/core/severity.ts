import type { Severity } from "../types.js";

export const severityOrder: Record<Severity, number> = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  INFO: 1
};

export const severities: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export function normalizeSeverity(value: string | undefined, fallback: Severity): Severity {
  if (!value) return fallback;
  const upper = value.toUpperCase();
  return severities.includes(upper as Severity) ? (upper as Severity) : fallback;
}

export function isAtOrAbove(severity: Severity, threshold: Severity): boolean {
  return severityOrder[severity] >= severityOrder[threshold];
}

export function compareSeverity(a: Severity, b: Severity): number {
  return severityOrder[b] - severityOrder[a];
}
