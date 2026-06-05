import type { AuditContext, SourceLocation } from "../types.js";
import { isBooleanLikeName } from "../frontends/circom/circom-utils.js";
import { isEcLikeName } from "../frontends/halo2/halo2-patterns.js";

export interface CircuitIntentHint {
  kind: "commitment" | "nullifier" | "merkle" | "selector" | "range" | "ec" | "public";
  subject: string;
  related: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  location: SourceLocation;
}

function locationOf(file: string, line = 1, snippet = ""): SourceLocation {
  return { file, line, column: 1, snippet };
}

export function inferCircuitIntent(context: AuditContext): CircuitIntentHint[] {
  const hints: CircuitIntentHint[] = [];

  for (const signal of context.ir.signals) {
    const lower = signal.baseName.toLowerCase();
    const refs = context.graph.signalReferences(signal.name);
    if (/commitment|commit/.test(lower)) {
      hints.push({ kind: "commitment", subject: signal.name, related: refs.flatMap((ref) => ref.snippet?.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []), confidence: "MEDIUM", location: signal });
    }
    if (/nullifier/.test(lower)) {
      hints.push({ kind: "nullifier", subject: signal.name, related: refs.flatMap((ref) => ref.snippet?.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []), confidence: "MEDIUM", location: signal });
    }
    if (/root|path|leaf/.test(lower)) {
      hints.push({ kind: "merkle", subject: signal.name, related: refs.flatMap((ref) => ref.snippet?.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []), confidence: "MEDIUM", location: signal });
    }
    if (isBooleanLikeName(signal.baseName)) {
      hints.push({ kind: "selector", subject: signal.name, related: refs.map((ref) => ref.snippet ?? "").filter(Boolean), confidence: "HIGH", location: signal });
    }
    if (/amount|balance|fee|nonce|index|timestamp|quantity|count|size|limb/i.test(signal.baseName)) {
      hints.push({ kind: "range", subject: signal.name, related: refs.map((ref) => ref.snippet ?? "").filter(Boolean), confidence: "HIGH", location: signal });
    }
    if (signal.kind === "input") {
      hints.push({ kind: "public", subject: signal.name, related: refs.map((ref) => ref.snippet ?? "").filter(Boolean), confidence: "MEDIUM", location: signal });
    }
  }

  for (const assignment of context.halo2?.assignments ?? []) {
    const text = `${assignment.label ?? ""} ${assignment.columnName ?? ""} ${assignment.assignedVariable ?? ""} ${assignment.expression}`;
    if (isEcLikeName(text)) {
      hints.push({
        kind: "ec",
        subject: assignment.label ?? assignment.columnName ?? "ec assignment",
        related: assignment.referencedSymbols,
        confidence: "MEDIUM",
        location: assignment
      });
    }
  }

  for (const query of context.halo2?.queries.filter((candidate) => candidate.queryType === "instance") ?? []) {
    hints.push({
      kind: "public",
      subject: query.columnName,
      related: [query.snippet ?? ""],
      confidence: "MEDIUM",
      location: query
    });
  }

  for (const file of context.halo2?.files ?? []) {
    if (/ec|ecc|curve|point|scalar|orchard/i.test(file.rawSource)) {
      hints.push({ kind: "ec", subject: file.filePath.split("/").pop() ?? file.filePath, related: ["base", "scalar", "point", "output"], confidence: "LOW", location: locationOf(file.filePath, 1, "EC-related Halo2 source") });
    }
  }

  return hints;
}
