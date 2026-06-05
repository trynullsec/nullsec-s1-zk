export declare const halo2DetectionPatterns: string[];
export declare const halo2DetectionRegex: RegExp;
export declare function isLikelyHalo2Source(source: string): boolean;
export declare function extractRustSymbols(expression: string): string[];
export declare function isHashOrSafeInverseContext(snippet: string): boolean;
export declare function isEcLikeName(value: string): boolean;
