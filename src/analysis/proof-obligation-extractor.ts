import type { AuditContext, ProofObligation, ProofObligationType, SourceLocation } from "../types.js";
import { inferCircuitIntent } from "./circuit-intent.js";

function makeId(type: ProofObligationType, subject: string, index: number): string {
  return `PO-${type.toUpperCase().replace(/_/g, "-")}-${subject.replace(/[^A-Za-z0-9]+/g, "-")}-${index}`;
}

function relatedInputsForCircom(context: AuditContext, subject: string): string[] {
  const refs = context.graph.signalReferences(subject);
  const names = new Set<string>();
  for (const ref of refs) {
    for (const token of ref.snippet?.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) ?? []) {
      if (!["signal", "input", "output", "component", "template"].includes(token) && token !== subject) names.add(token);
    }
  }
  for (const input of context.ir.signals.filter((signal) => signal.kind === "input")) {
    if (/secret|amount|asset|nullifier|note|leaf|path|base|scalar|balance/i.test(input.baseName)) names.add(input.name);
  }
  return [...names].slice(0, 8);
}

function locationFallback(subject: string): SourceLocation {
  return { file: "unknown", line: 1, column: 1, snippet: subject };
}

export function extractProofObligations(context: AuditContext): ProofObligation[] {
  const obligations: ProofObligation[] = [];
  const hints = inferCircuitIntent(context);

  hints.forEach((hint, index) => {
    if (hint.kind === "commitment") {
      obligations.push({
        id: makeId("commitment_binding", hint.subject, index),
        type: "commitment_binding",
        subject: hint.subject,
        requiredInputs: relatedInputsForCircom(context, hint.subject).filter((name) => /secret|amount|asset|nullifier|note/i.test(name)),
        expectedRelation: "Commitment output should bind the secret, amount, asset, nullifier, or note data it claims to commit to.",
        relatedSignals: hint.related,
        confidence: hint.confidence,
        sourceLocation: hint.location
      });
    }
    if (hint.kind === "nullifier") {
      obligations.push({
        id: makeId("nullifier_binding", hint.subject, index),
        type: "nullifier_binding",
        subject: hint.subject,
        requiredInputs: relatedInputsForCircom(context, hint.subject).filter((name) => /secret|note|nullifier/i.test(name)),
        expectedRelation: "Nullifier should bind secret or note data so it cannot be chosen independently.",
        relatedSignals: hint.related,
        confidence: hint.confidence,
        sourceLocation: hint.location
      });
    }
    if (hint.kind === "merkle") {
      obligations.push({
        id: makeId("merkle_root_binding", hint.subject, index),
        type: "merkle_root_binding",
        subject: hint.subject,
        requiredInputs: relatedInputsForCircom(context, hint.subject).filter((name) => /path|leaf|root|index/i.test(name)),
        expectedRelation: "Merkle root should bind path elements, path selector/index values, and the leaf.",
        relatedSignals: hint.related,
        confidence: hint.confidence,
        sourceLocation: hint.location
      });
    }
    if (hint.kind === "selector") {
      obligations.push({
        id: makeId("selector_booleanity", hint.subject, index),
        type: "selector_booleanity",
        subject: hint.subject,
        requiredInputs: [hint.subject],
        expectedRelation: "Selector or path index should be constrained to boolean values.",
        relatedSignals: hint.related,
        confidence: "HIGH",
        sourceLocation: hint.location
      });
    }
    if (hint.kind === "range") {
      obligations.push({
        id: makeId("range_constraint", hint.subject, index),
        type: "range_constraint",
        subject: hint.subject,
        requiredInputs: [hint.subject],
        expectedRelation: "Arithmetic value should be range constrained to its intended integer domain.",
        relatedSignals: hint.related,
        confidence: hint.confidence,
        sourceLocation: hint.location
      });
    }
    if (hint.kind === "public") {
      obligations.push({
        id: makeId("public_input_binding", hint.subject, index),
        type: "public_input_binding",
        subject: hint.subject,
        requiredInputs: [hint.subject],
        expectedRelation: "Public input or instance value should be connected to private witness data or a constrained relation.",
        relatedSignals: hint.related,
        confidence: hint.confidence,
        sourceLocation: hint.location
      });
    }
  });

  const halo2 = context.halo2;
  if (halo2) {
    const files = [...new Set(halo2.assignments.map((assignment) => assignment.file))];
    for (const file of files) {
      const fileAssignments = halo2.assignments.filter((assignment) => assignment.file === file);
      if (!fileAssignments.some((assignment) => /ec|curve|point|scalar|base|accumulator|output/i.test(`${assignment.label ?? ""} ${assignment.columnName ?? ""}`))) continue;
      const first = fileAssignments.find((assignment) => /ec|curve|point|scalar|base|accumulator|output/i.test(`${assignment.label ?? ""} ${assignment.columnName ?? ""}`));
      const related = fileAssignments
        .filter((assignment) => /base|scalar|point|accumulator|output|x|y/i.test(`${assignment.label ?? ""} ${assignment.columnName ?? ""}`))
        .map((assignment) => assignment.label ?? assignment.columnName ?? "unknown");
      obligations.push({
        id: makeId("ec_multiplication", first?.file.split("/").pop() ?? "halo2-ec", obligations.length),
        type: "ec_multiplication",
        subject: first?.file.split("/").pop() ?? "Halo2 EC operation",
        requiredInputs: related,
        expectedRelation: "Output point should bind base point and scalar through complete elliptic-curve multiplication constraints.",
        relatedSignals: related,
        confidence: "MEDIUM",
        sourceLocation: first ?? locationFallback("Halo2 EC operation")
      });
    }
  }

  return obligations;
}
