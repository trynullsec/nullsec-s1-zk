import type { SignalDeclaration } from "../types.js";
export declare class SignalTable {
    private readonly byBaseName;
    constructor(signals: SignalDeclaration[]);
    get(name: string): SignalDeclaration[];
}
