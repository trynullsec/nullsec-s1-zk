import { parseCircomFile } from "../src/frontends/circom/circom-parser.js";
import { buildCircuitIR } from "../src/frontends/circom/circom-ir-builder.js";
import { ConstraintGraph } from "../src/ir/constraint-graph.js";
import { defaultConfig } from "../src/config.js";
import { RuleEngine } from "../src/core/rule-engine.js";
import { allRules } from "../src/rules/index.js";

export function parseSource(source: string) {
  return parseCircomFile("test.circom", source);
}

export function analyzeSource(source: string) {
  const parsed = parseSource(source);
  const ir = buildCircuitIR([parsed]);
  const graph = new ConstraintGraph(ir);
  const engine = new RuleEngine(allRules);
  return engine.run({ target: "test.circom", ir, graph, config: defaultConfig }).issues;
}
