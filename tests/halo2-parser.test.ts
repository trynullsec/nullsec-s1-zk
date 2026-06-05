import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadRustFiles } from "../src/core/file-loader.js";
import { isLikelyHalo2Source } from "../src/frontends/halo2/halo2-patterns.js";
import { parseHalo2File } from "../src/frontends/halo2/halo2-parser.js";

describe("Halo2 parser", () => {
  it("detects likely Halo2 Rust files", async () => {
    const files = await loadRustFiles("./examples/halo2");
    expect(files.some((file) => file.filePath.endsWith("unconstrained-advice.rs") && isLikelyHalo2Source(file.rawSource))).toBe(true);
  });

  it("extracts gates, queries, assignments, and constraints", () => {
    const filePath = "./examples/halo2/safe/bound-instance.rs";
    const source = readFileSync(filePath, "utf8");
    const parsed = parseHalo2File(filePath, source);

    expect(parsed.gates.some((gate) => gate.name === "public input relation")).toBe(true);
    expect(parsed.queries.some((query) => query.queryType === "advice")).toBe(true);
    expect(parsed.queries.some((query) => query.queryType === "instance")).toBe(true);
    expect(parsed.instanceConstraints).toHaveLength(1);
    expect(parsed.columns.some((column) => column.columnType === "instance" && column.equalityEnabled)).toBe(true);
  });

  it("extracts assign_advice and constrain_equal", () => {
    const source = readFileSync("./examples/halo2/safe/constrained-advice.rs", "utf8");
    const parsed = parseHalo2File("constrained-advice.rs", source);
    expect(parsed.assignments.some((assignment) => assignment.assignmentType === "advice")).toBe(true);
    expect(parsed.equalityConstraints).toHaveLength(1);
    expect(parsed.selectors.some((selector) => selector.enabledLines.length > 0)).toBe(true);
  });
});
