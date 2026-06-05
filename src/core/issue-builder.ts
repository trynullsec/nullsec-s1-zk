import type { Confidence, Issue, Severity, SourceLocation } from "../types.js";

let issueCounter = 0;

export function resetIssueCounter(): void {
  issueCounter = 0;
}

export function buildIssue(input: {
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
}): Issue {
  issueCounter += 1;
  return {
    id: `${input.ruleId}-${String(issueCounter).padStart(4, "0")}`,
    ruleId: input.ruleId,
    title: input.title,
    severity: input.severity,
    confidence: input.confidence ?? "HIGH",
    file: input.location.file,
    line: input.location.line,
    column: input.location.column,
    snippet: input.location.snippet,
    templateName: input.location.templateName,
    signalName: input.signalName,
    explanation: input.explanation,
    impact: input.impact,
    suggestedFix: input.suggestedFix,
    references: input.references,
    tags: input.tags ?? [],
    metadata: input.metadata
  };
}
