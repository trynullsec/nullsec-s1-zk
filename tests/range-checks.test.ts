import { describe, expect, it } from "vitest";
import { analyzeSource } from "./helpers.js";
import { scanTarget } from "../src/scanner.js";
import {
  assessRangeCheckRisk,
  classifyRangeCheckSignal,
  isHashLikeCategory,
  isPrimaryRangeCategory
} from "../src/core/range-check-classifier.js";
import { parseSource } from "./helpers.js";
import { buildCircuitIR } from "../src/frontends/circom/circom-ir-builder.js";
import { ConstraintGraph } from "../src/ir/constraint-graph.js";
import { defaultConfig } from "../src/config.js";

describe("range check classifier", () => {
  it("classifies hashes, commitments, roots, and primary targets distinctly", () => {
    expect(classifyRangeCheckSignal("nullifierHash", "input")).toBe("nullifier");
    expect(classifyRangeCheckSignal("commitment", "output")).toBe("commitment");
    expect(classifyRangeCheckSignal("merkleRoot", "input")).toBe("root");
    expect(classifyRangeCheckSignal("amount", "input")).toBe("amount");
    expect(classifyRangeCheckSignal("remainingBalance", "output")).toBe("derived");
    expect(isHashLikeCategory("nullifier")).toBe(true);
    expect(isPrimaryRangeCategory("balance")).toBe(true);
    expect(isPrimaryRangeCategory("nullifier")).toBe(false);
  });
});

describe("NS-ZK-006", () => {
  it("catches missing range checks on primary bounded-integer inputs", () => {
    const issues = analyzeSource(`template T() {
  signal input amount;
  signal output out;
  out <== amount + 1;
}`);
    const issue = issues.find((candidate) => candidate.ruleId === "NS-ZK-006" && candidate.signalName === "amount");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("HIGH");
    expect(issue?.confidence).toBe("HIGH");
  });

  it("does not flag Num2Bits usage", () => {
    const issues = analyzeSource(`template T() {
  signal input amount;
  signal output out;
  component bits = Num2Bits(64);
  bits.in <== amount;
  out <== amount;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-006" && issue.signalName === "amount")).toBe(false);
  });

  it("does not require range checks for hash binding signals", () => {
    const issues = analyzeSource(`template T() {
  signal input nullifierHash;
  signal input computedNullifierHash;
  signal output ok;
  nullifierHash === computedNullifierHash;
  ok <== 1;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-006")).toBe(false);
  });

  it("does not require range checks for hash component outputs", () => {
    const issues = analyzeSource(`template T() {
  signal input secret;
  signal output commitment;
  component h = Poseidon(1);
  h.inputs[0] <== secret;
  commitment <== h.out;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-006" && issue.signalName === "commitment")).toBe(false);
  });

  it("does not flag derived outputs when operands are range-checked", () => {
    const issues = analyzeSource(`template T() {
  signal input amount;
  signal input balance;
  signal output remainingBalance;
  component amountBits = Num2Bits(64);
  component balanceBits = Num2Bits(64);
  amountBits.in <== amount;
  balanceBits.in <== balance;
  remainingBalance <== balance - amount;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-006" && issue.signalName === "remainingBalance")).toBe(false);
  });

  it("does not flag allowedAmount style derived outputs", () => {
    const issues = analyzeSource(`template T() {
  signal input isAdmin;
  signal input balance;
  signal output allowedAmount;
  component balanceBits = Num2Bits(64);
  balanceBits.in <== balance;
  isAdmin * (isAdmin - 1) === 0;
  allowedAmount <== isAdmin * balance;
}`);
    expect(issues.some((issue) => issue.ruleId === "NS-ZK-006" && issue.severity === "HIGH")).toBe(false);
  });

  it("reports balance without range check at high confidence", () => {
    const parsed = parseSource(`template T() {
  signal input balance;
  signal output out;
  out <== balance + 1;
}`);
    const ir = buildCircuitIR([parsed]);
    const graph = new ConstraintGraph(ir);
    const signal = parsed.signals.find((candidate) => candidate.baseName === "balance");
    expect(signal).toBeDefined();
    const assessment = assessRangeCheckRisk(signal!, { target: "test", ir, graph, config: defaultConfig });
    expect(assessment.shouldReport).toBe(true);
    expect(assessment.confidence).toBe("HIGH");
    expect(assessment.severity).toBe("HIGH");
  });

  it("produces zero HIGH severity findings on safe examples", async () => {
    const run = await scanTarget("./examples/safe", { format: "json", failOn: "HIGH" });
    const highRangeIssues = run.result.issues.filter((issue) => issue.ruleId === "NS-ZK-006" && issue.severity === "HIGH");
    expect(highRangeIssues).toHaveLength(0);
  });
});
