import { defaultConfig } from "../src/config.js";
import { buildCircuitIR } from "../src/frontends/circom/circom-ir-builder.js";
import { parseCircomFile } from "../src/frontends/circom/circom-parser.js";
import { buildHalo2IR } from "../src/frontends/halo2/halo2-ir-builder.js";
import { parseHalo2File } from "../src/frontends/halo2/halo2-parser.js";
import { ConstraintGraph } from "../src/ir/constraint-graph.js";
import type { AuditContext } from "../src/types.js";

export function circomContext(source: string): AuditContext {
  const parsed = parseCircomFile("test.circom", source);
  const ir = buildCircuitIR([parsed]);
  return { target: "test", ir, graph: new ConstraintGraph(ir), config: defaultConfig, halo2: buildHalo2IR([]) };
}

export function halo2Context(source: string, file = "test.rs"): AuditContext {
  const halo2 = buildHalo2IR([parseHalo2File(file, source)]);
  const ir = buildCircuitIR([]);
  return { target: file, ir, graph: new ConstraintGraph(ir), config: defaultConfig, halo2 };
}
