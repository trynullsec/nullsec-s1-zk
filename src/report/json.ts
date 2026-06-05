import type { AuditResult } from "../types.js";

export function renderJsonReport(result: AuditResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}
