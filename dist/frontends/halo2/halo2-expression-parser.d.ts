export interface Halo2ParsedGateExpression {
    returnedExpressions: string[];
    variableReferences: string[];
    selectorAliases: Record<string, string>;
    adviceAliases: Record<string, string>;
    instanceAliases: Record<string, string>;
    fixedAliases: Record<string, string>;
    rotations: Array<{
        alias: string;
        rotation: "cur" | "prev" | "next" | string;
    }>;
}
export declare function parseHalo2GateExpression(body: string): Halo2ParsedGateExpression;
export declare function expressionUsesAliasAsMultiplier(expression: string, alias: string): boolean;
