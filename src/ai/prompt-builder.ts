import type { Issue } from "../types.js";

export function buildReasoningPrompt(issue: Issue, surroundingCode: string, circuitIntent = "Unknown from static analysis"): string {
  const codeFenceLanguage = issue.ruleId.startsWith("NS-H2") ? "rust" : "circom";
  return `You are reviewing a zero-knowledge circuit issue reported by Nullsec S1-ZK.

Circuit intent:
${circuitIntent}

Issue:
- Rule: ${issue.ruleId}
- Title: ${issue.title}
- Severity: ${issue.severity}
- Confidence: ${issue.confidence}
- File: ${issue.file}:${issue.line}
- Signal: ${issue.signalName ?? "unknown"}

Finding:
${issue.explanation}

Impact:
${issue.impact}

Surrounding code:
\`\`\`${codeFenceLanguage}
${surroundingCode}
\`\`\`

Reasoning tasks:
1. Summarize what the circuit appears to claim to prove.
2. Explain the constraint failure without overstating formal guarantees.
3. Assess exploitability and assumptions.
4. Propose a concrete patch.
5. Draft audit-report language suitable for a security review.`;
}
