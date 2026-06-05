import type { AuditResult, NullsecConfig, ParsedCircuitFile } from "../types.js";
import type { Halo2CircuitFile } from "../frontends/halo2/halo2-types.js";
export declare function auditParsedFiles(target: string, parsedFiles: ParsedCircuitFile[], config: NullsecConfig, halo2Files?: Halo2CircuitFile[]): AuditResult;
