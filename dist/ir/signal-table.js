import { baseSignalName } from "../frontends/circom/circom-utils.js";
export class SignalTable {
    byBaseName = new Map();
    constructor(signals) {
        for (const signal of signals) {
            const key = baseSignalName(signal.name);
            const existing = this.byBaseName.get(key) ?? [];
            existing.push(signal);
            this.byBaseName.set(key, existing);
        }
    }
    get(name) {
        return this.byBaseName.get(baseSignalName(name)) ?? [];
    }
}
//# sourceMappingURL=signal-table.js.map