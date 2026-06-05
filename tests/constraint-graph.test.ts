import { describe, expect, it } from "vitest";
import { parseSource } from "./helpers.js";
import { buildCircuitIR } from "../src/frontends/circom/circom-ir-builder.js";
import { ConstraintGraph } from "../src/ir/constraint-graph.js";

describe("ConstraintGraph", () => {
  it("answers assignment, constraint, booleanity, range, and binding queries", () => {
    const parsed = parseSource(`template T() {
  signal input amount;
  signal input unused;
  signal input isAdmin;
  signal output out;
  component bits = Num2Bits(64);
  bits.in <== amount;
  isAdmin * (isAdmin - 1) === 0;
  out <-- amount;
}`);
    const graph = new ConstraintGraph(buildCircuitIR([parsed]));
    expect(graph.assignedByHint()).toHaveLength(1);
    expect(graph.assignedByConstraint()).toHaveLength(1);
    expect(graph.appearsInAnyConstraint("amount")).toBe(true);
    expect(graph.unboundInputs().map((signal) => signal.name)).toContain("unused");
    expect(graph.hasBooleanityConstraint("isAdmin")).toBe(true);
    expect(graph.hasRangeCheck("amount")).toBe(true);
  });
});
