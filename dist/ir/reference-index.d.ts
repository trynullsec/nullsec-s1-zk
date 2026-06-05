import type { CircuitIR, SourceLocation } from "../types.js";
export declare class ReferenceIndex {
    private readonly locations;
    constructor(ir: CircuitIR);
    get(signalName: string): SourceLocation[];
}
