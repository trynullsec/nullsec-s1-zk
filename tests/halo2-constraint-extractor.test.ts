import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseHalo2File } from "../src/frontends/halo2/halo2-parser.js";
import { buildHalo2IR } from "../src/frontends/halo2/halo2-ir-builder.js";
import { extractHalo2ConstraintModel } from "../src/frontends/halo2/halo2-constraint-extractor.js";
import { Halo2ConstraintGraph } from "../src/frontends/halo2/halo2-constraint-graph.js";

describe("Halo2 constraint extractor", () => {
  it("extracts returned gate expressions, advice queries, selector gating, and rotations", () => {
    const source = `use halo2_proofs::plonk::ConstraintSystem;
fn configure(meta: &mut ConstraintSystem<Fp>) {
  let a = meta.advice_column();
  let b = meta.advice_column();
  let c = meta.advice_column();
  let s_mul = meta.selector();
  meta.create_gate("mul", |meta| {
    let a = meta.query_advice(a, Rotation::cur());
    let b = meta.query_advice(b, Rotation::prev());
    let c = meta.query_advice(c, Rotation::next());
    let s = meta.query_selector(s_mul);
    vec![s * (a * b - c)]
  });
}`;
    const parsed = parseHalo2File("mul.rs", source);
    const gate = parsed.gates[0];
    expect(gate?.name).toBe("mul");
    expect(gate?.returnedExpressions).toContain("s * (a * b - c)");
    expect(gate?.adviceAliases).toMatchObject({ a: "a", b: "b", c: "c" });
    expect(gate?.selectorAliases).toMatchObject({ s: "s_mul" });
    expect(gate?.variableReferences).toEqual(expect.arrayContaining(["a", "b", "c", "s"]));
  });

  it("connects advice queries and selectors to gates", () => {
    const parsed = parseHalo2File("mul.rs", `use halo2_proofs::plonk::ConstraintSystem;
fn configure(meta: &mut ConstraintSystem<Fp>) {
  let a = meta.advice_column();
  let s_mul = meta.selector();
  meta.create_gate("mul", |meta| {
    let a = meta.query_advice(a, Rotation::cur());
    let s = meta.query_selector(s_mul);
    vec![s * a]
  });
}`);
    const model = extractHalo2ConstraintModel(buildHalo2IR([parsed]));
    expect(model.gates[0]?.adviceColumns).toContain("a");
    expect(model.gates[0]?.selectorColumns).toContain("s_mul");
    const graph = new Halo2ConstraintGraph(buildHalo2IR([parsed]));
    expect(graph.selectorUsedAsGateMultiplier("s_mul")).toBe(true);
  });
});
