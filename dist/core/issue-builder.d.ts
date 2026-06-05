import type { Confidence, Issue, Severity, SourceLocation } from "../types.js";
export declare function resetIssueCounter(): void;
export declare function buildIssue(input: {
    ruleId: string;
    title: string;
    severity: Severity;
    confidence?: Confidence;
    location: SourceLocation;
    signalName?: string;
    explanation: string;
    impact: string;
    suggestedFix: string;
    references?: string[];
    tags?: string[];
    metadata?: Record<string, unknown>;
}): Issue;
