import type { Issue } from "../types.js";
export interface ReasoningRequest {
    issue: Issue;
    surroundingCode: string;
    circuitIntent?: string;
}
export interface ReasoningResponse {
    exploitabilityAssessment: string;
    patchGuidance: string;
    auditLanguage: string;
}
export interface ReasoningProvider {
    name: string;
    reason(request: ReasoningRequest): Promise<ReasoningResponse>;
}
