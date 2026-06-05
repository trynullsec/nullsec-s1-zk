import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyzeTaintFlow } from "../src/analysis/taint-flow.js";
import { circomContext, halo2Context } from "./analysis-helpers.js";

describe("taint flow", () => {
  it("tracks Circom witness-like values to outputs", () => {
    const flows = analyzeTaintFlow(circomContext(`template T() {
  signal input secret;
  signal output commitment;
  commitment <-- secret;
}`));
    expect(flows.some((flow) => flow.sink === "commitment" && !flow.constrained)).toBe(true);
  });

  it("tracks Halo2 EC outputs with constraint support", () => {
    const source = readFileSync("./benchmarks/historical/orchard-inspired/vulnerable-ec-mul.rs", "utf8");
    const flows = analyzeTaintFlow(halo2Context(source, "vulnerable-ec-mul.rs"));
    expect(flows.some((flow) => flow.risk === "ec_unconnected_coordinate" && flow.sink.includes("base point y") && !flow.constrained)).toBe(true);
  });
});
