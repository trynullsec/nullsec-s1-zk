import type { ComponentDeclaration } from "../types.js";
export declare class ComponentTable {
    private readonly byName;
    constructor(components: ComponentDeclaration[]);
    get(name: string): ComponentDeclaration | undefined;
}
