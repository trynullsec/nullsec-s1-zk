import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractProofObligations } from "../src/analysis/proof-obligation-extractor.js";
import { circomContext, halo2Context } from "./analysis-helpers.js";

describe("proof obligation extractor", () => {
  it("detects commitment obligations", () => {
    const context = circomContext(`template T() {
  signal input secret;
  signal input amount;
  signal output commitment;
  commitment <== secret + amount;
}`);
    expect(extractProofObligations(context).some((obligation) => obligation.type === "commitment_binding")).toBe(true);
  });

  it("detects Merkle selector obligations", () => {
    const context = circomContext(`template T() {
  signal input pathIndex;
  signal input leaf;
  signal input root;
  root === leaf + pathIndex;
}`);
    const obligations = extractProofObligations(context);
    expect(obligations.some((obligation) => obligation.type === "merkle_root_binding")).toBe(true);
    expect(obligations.some((obligation) => obligation.type === "selector_booleanity" && obligation.subject === "pathIndex")).toBe(true);
  });

  it("detects EC multiplication obligations", () => {
    const source = readFileSync("./benchmarks/historical/orchard-inspired/vulnerable-ec-mul.rs", "utf8");
    const obligations = extractProofObligations(halo2Context(source, "vulnerable-ec-mul.rs"));
    expect(obligations.some((obligation) => obligation.type === "ec_multiplication")).toBe(true);
  });
});
