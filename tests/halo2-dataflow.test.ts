import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseHalo2File } from "../src/frontends/halo2/halo2-parser.js";
import { buildHalo2IR } from "../src/frontends/halo2/halo2-ir-builder.js";
import { Halo2ConstraintGraph } from "../src/frontends/halo2/halo2-constraint-graph.js";
import { assignmentFlows, unconstrainedAssignments } from "../src/frontends/halo2/halo2-dataflow.js";

describe("Halo2 dataflow", () => {
  it("recognizes assignments connected to gate columns and public instance bindings", () => {
    const parsed = parseHalo2File("safe.rs", readFileSync("./examples/halo2/safe/bound-instance.rs", "utf8"));
    const graph = new Halo2ConstraintGraph(buildHalo2IR([parsed]));
    expect(graph.instanceQueryIsBound("instance", "safe.rs")).toBe(true);
    expect(graph.columnHasEqualityEnabled("instance")).toBe(true);
  });

  it("detects unconstrained advice assignments", () => {
    const parsed = parseHalo2File("vuln.rs", readFileSync("./examples/halo2/vulnerable/unconstrained-advice.rs", "utf8"));
    const graph = new Halo2ConstraintGraph(buildHalo2IR([parsed]));
    const flows = assignmentFlows(graph);
    expect(flows.some((flow) => flow.assignment.label === "secret amount" && !flow.connected)).toBe(true);
    expect(unconstrainedAssignments(graph).length).toBeGreaterThan(0);
  });

  it("does not mark gate-connected advice as unconstrained", () => {
    const parsed = parseHalo2File("safe.rs", readFileSync("./examples/halo2/safe/constrained-advice.rs", "utf8"));
    const graph = new Halo2ConstraintGraph(buildHalo2IR([parsed]));
    expect(unconstrainedAssignments(graph).some((flow) => flow.assignment.label === "value")).toBe(false);
  });
});
