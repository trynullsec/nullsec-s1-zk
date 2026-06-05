import type { AuditResult, OutputFormat, ScanOptions } from "./types.js";
export interface ScanRunResult {
    result: AuditResult;
    output: string;
    exitCode: 0 | 1;
}
export declare function scanTarget(target: string, options?: ScanOptions): Promise<ScanRunResult>;
export declare function renderReport(result: AuditResult, format: OutputFormat): string;
