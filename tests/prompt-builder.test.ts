import { describe, expect, it } from "vitest";
import { buildReasoningPrompt } from "../src/ai/prompt-builder.js";
import type { Issue } from "../src/types.js";

function issue(ruleId: string): Issue {
  return {
    id: `${ruleId}-0001`,
    ruleId,
    title: "Test issue",
    severity: "HIGH",
    confidence: "HIGH",
    file: "test",
    line: 1,
    explanation: "test",
    impact: "test",
    suggestedFix: "test",
    tags: []
  };
}

describe("prompt builder", () => {
  it("uses rust fences for Halo2 issues", () => {
    expect(buildReasoningPrompt(issue("NS-H2-005"), "fn main() {}")).toContain("```rust");
  });

  it("uses circom fences for Circom/ZK issues", () => {
    expect(buildReasoningPrompt(issue("NS-ZK-001"), "template T() {}")).toContain("```circom");
  });
});
