import type { CircuitIR, SourceLocation } from "../types.js";
import { baseSignalName } from "../frontends/circom/circom-utils.js";

export class ReferenceIndex {
  private readonly locations = new Map<string, SourceLocation[]>();

  constructor(ir: CircuitIR) {
    for (const node of [...ir.assignments, ...ir.constraints, ...ir.assertions]) {
      for (const ref of node.referencedSignals) {
        const key = baseSignalName(ref);
        const existing = this.locations.get(key) ?? [];
        existing.push(node);
        this.locations.set(key, existing);
      }
    }
  }

  get(signalName: string): SourceLocation[] {
    return this.locations.get(baseSignalName(signalName)) ?? [];
  }
}
