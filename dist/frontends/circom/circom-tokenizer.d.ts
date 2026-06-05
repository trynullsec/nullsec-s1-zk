export interface CircomToken {
    type: "identifier" | "number" | "operator" | "punctuation" | "string";
    value: string;
    line: number;
    column: number;
}
export declare function tokenizeCircom(source: string): CircomToken[];
