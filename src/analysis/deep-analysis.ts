import type { AuditContext, DeepAnalysisResult, Issue } from "../types.js";
import { generateExploitHypotheses } from "./exploit-hypothesis.js";
import { extractProofObligations } from "./proof-obligation-extractor.js";
import { checkProofObligations, summarizeRelationChecks } from "./relation-checker.js";
import { analyzeTaintFlow } from "./taint-flow.js";

export function runDeepAnalysis(context: AuditContext, issues: Issue[]): DeepAnalysisResult {
  const taintFlows = analyzeTaintFlow(context);
  const proofObligations = extractProofObligations(context);
  const relationChecks = checkProofObligations(context, proofObligations, taintFlows);
  return {
    enabled: true,
    proofObligations,
    relationChecks,
    proofObligationSummary: summarizeRelationChecks(relationChecks),
    taintFlows,
    exploitHypotheses: generateExploitHypotheses(issues, relationChecks)
  };
}
