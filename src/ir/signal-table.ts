import type { SignalDeclaration } from "../types.js";
import { baseSignalName } from "../frontends/circom/circom-utils.js";

export class SignalTable {
  private readonly byBaseName = new Map<string, SignalDeclaration[]>();

  constructor(signals: SignalDeclaration[]) {
    for (const signal of signals) {
      const key = baseSignalName(signal.name);
      const existing = this.byBaseName.get(key) ?? [];
      existing.push(signal);
      this.byBaseName.set(key, existing);
    }
  }

  get(name: string): SignalDeclaration[] {
    return this.byBaseName.get(baseSignalName(name)) ?? [];
  }
}
