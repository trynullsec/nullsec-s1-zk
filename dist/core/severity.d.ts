import type { Severity } from "../types.js";
export declare const severityOrder: Record<Severity, number>;
export declare const severities: Severity[];
export declare function normalizeSeverity(value: string | undefined, fallback: Severity): Severity;
export declare function isAtOrAbove(severity: Severity, threshold: Severity): boolean;
export declare function compareSeverity(a: Severity, b: Severity): number;
