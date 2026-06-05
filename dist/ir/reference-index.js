import { baseSignalName } from "../frontends/circom/circom-utils.js";
export class ReferenceIndex {
    locations = new Map();
    constructor(ir) {
        for (const node of [...ir.assignments, ...ir.constraints, ...ir.assertions]) {
            for (const ref of node.referencedSignals) {
                const key = baseSignalName(ref);
                const existing = this.locations.get(key) ?? [];
                existing.push(node);
                this.locations.set(key, existing);
            }
        }
    }
    get(signalName) {
        return this.locations.get(baseSignalName(signalName)) ?? [];
    }
}
//# sourceMappingURL=reference-index.js.map