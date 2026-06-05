import type { AuditContext, Confidence, Severity, SignalDeclaration, SignalKind } from "../types.js";
export type RangeCheckCategory = "amount" | "balance" | "fee" | "nonce" | "index" | "timestamp" | "quantity" | "count" | "size" | "limb" | "hash" | "commitment" | "root" | "nullifier" | "selector" | "derived" | "unknown";
export interface RangeCheckAssessment {
    shouldReport: boolean;
    category: RangeCheckCategory;
    confidence: Confidence;
    severity: Severity;
    explanation: string;
}
export declare function classifyRangeCheckSignal(name: string, kind: SignalKind): RangeCheckCategory;
export declare function isHashLikeCategory(category: RangeCheckCategory): boolean;
export declare function isPrimaryRangeCategory(category: RangeCheckCategory): boolean;
export declare function isHashComponentOutput(signal: SignalDeclaration, context: AuditContext): boolean;
export declare function isUsedAsBoundedInteger(signal: SignalDeclaration, context: AuditContext): boolean;
export declare function operandsHaveRangeCheck(signal: SignalDeclaration, context: AuditContext): boolean;
export declare function assessRangeCheckRisk(signal: SignalDeclaration, context: AuditContext): RangeCheckAssessment;
