export function buildReasoningPrompt(issue, surroundingCode, circuitIntent = "Unknown from static analysis") {
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
\`\`\`circom
${surroundingCode}
\`\`\`

Reasoning tasks:
1. Summarize what the circuit appears to claim to prove.
2. Explain the constraint failure without overstating formal guarantees.
3. Assess exploitability and assumptions.
4. Propose a concrete patch.
5. Draft audit-report language suitable for a security review.`;
}
//# sourceMappingURL=prompt-builder.js.map