import { describe, expect, it } from "vitest";
import { parseSource } from "./helpers.js";
import { stripCircomComments } from "../src/frontends/circom/circom-comments.js";

describe("Circom parser", () => {
  const source = `pragma circom 2.1.0;
// ignored comment
template T() {
  signal input a;
  signal output out;
  signal tmp[2];
  component h = Poseidon(2);
  tmp[0] <-- a * 2;
  out <== tmp[0];
  out === a;
  assert(out === a);
}`;

  it("parses signals, assignments, constraints, assertions, components, and line numbers", () => {
    const parsed = parseSource(source);
    expect(parsed.signals.map((signal) => signal.name)).toEqual(["a", "out", "tmp[]"]);
    expect(parsed.signals.find((signal) => signal.name === "a")?.kind).toBe("input");
    expect(parsed.signals.find((signal) => signal.name === "out")?.kind).toBe("output");
    expect(parsed.assignments.some((assignment) => assignment.operator === "<--")).toBe(true);
    expect(parsed.assignments.some((assignment) => assignment.operator === "<==")).toBe(true);
    expect(parsed.constraints.some((constraint) => constraint.operator === "===")).toBe(true);
    expect(parsed.assertions).toHaveLength(1);
    expect(parsed.components[0]?.templateType).toBe("Poseidon");
    expect(parsed.assignments[0]?.line).toBe(8);
  });

  it("strips comments while preserving lines", () => {
    const stripped = stripCircomComments("signal input a; // hello\n/* block\ncomment */\nsignal output b;");
    expect(stripped.source.split("\n")).toHaveLength(4);
    expect(stripped.source).not.toContain("hello");
  });
});
