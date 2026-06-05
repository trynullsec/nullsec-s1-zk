import { describe, expect, it } from "vitest";
import { parseSource } from "./helpers.js";
import { buildCircuitIR } from "../src/frontends/circom/circom-ir-builder.js";
import { ConstraintGraph } from "../src/ir/constraint-graph.js";
import { RuleEngine } from "../src/core/rule-engine.js";
import { allRules } from "../src/rules/index.js";
import { defaultConfig } from "../src/config.js";

describe("RuleEngine", () => {
  it("supports disabled rules and severity overrides", () => {
    const ir = buildCircuitIR([
      parseSource(`template T() {
  signal input amount;
  signal output out;
  out <== amount;
}`)
    ]);
    const engine = new RuleEngine(allRules);
    const { issues } = engine.run({
      target: "test",
      ir,
      graph: new ConstraintGraph(ir),
      config: { ...defaultConfig, rules: { "NS-ZK-006": "off", "NS-ZK-003": "critical" } }
    });
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-006")).toBe(false);
    expect(issues.every((issue) => issue.ruleId !== "NS-ZK-003" || issue.severity === "CRITICAL")).toBe(true);
  });
});
