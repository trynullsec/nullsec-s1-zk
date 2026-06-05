import { Halo2ConstraintGraph } from "../frontends/halo2/halo2-constraint-graph.js";
import type { AuditContext, ProofObligation, RelationCheckResult, RelationStatus, TaintFlowPath } from "../types.js";

function statusCounts(connections: boolean[]): RelationStatus {
  if (connections.length === 0) return "unknown";
  if (connections.every(Boolean)) return "satisfied";
  if (connections.some(Boolean)) return "partially_satisfied";
  return "missing";
}

function result(obligation: ProofObligation, status: RelationStatus, evidence: string[], missing: string[], explanation: string): RelationCheckResult {
  return { obligationId: obligation.id, status, evidence, missing, explanation };
}

export function checkProofObligations(context: AuditContext, obligations: ProofObligation[], taintFlows: TaintFlowPath[] = []): RelationCheckResult[] {
  const halo2Graph = context.halo2 ? new Halo2ConstraintGraph(context.halo2) : undefined;

  return obligations.map((obligation) => {
    if (obligation.type === "selector_booleanity") {
      const ok = context.graph.hasBooleanityConstraint(obligation.subject);
      return result(
        obligation,
        ok ? "satisfied" : "missing",
        ok ? [`Booleanity constraint found for ${obligation.subject}`] : [],
        ok ? [] : [obligation.subject],
        ok ? "Selector-like value has a recognized booleanity constraint." : "Selector-like value does not have a recognized booleanity constraint."
      );
    }

    if (obligation.type === "range_constraint") {
      const ok = context.graph.hasRangeCheck(obligation.subject);
      return result(
        obligation,
        ok ? "satisfied" : "missing",
        ok ? [`Range-check pattern found for ${obligation.subject}`] : [],
        ok ? [] : [obligation.subject],
        ok ? "Arithmetic value has a recognized range-check pattern." : "Arithmetic value does not have a recognized range-check pattern."
      );
    }

    if (obligation.type === "public_input_binding") {
      const circomBound = context.graph.appearsInAnyConstraint(obligation.subject);
      const halo2Bound = halo2Graph?.instanceQueryIsBound(obligation.subject, obligation.sourceLocation.file) ?? false;
      const ok = circomBound || halo2Bound;
      return result(
        obligation,
        ok ? "satisfied" : "missing",
        ok ? [`Public value ${obligation.subject} appears connected to constraints or instance binding`] : [],
        ok ? [] : [obligation.subject],
        ok ? "Public value is connected to a parsed relation." : "Public value is not connected to a parsed relation."
      );
    }

    if (obligation.type === "commitment_binding" || obligation.type === "nullifier_binding" || obligation.type === "merkle_root_binding") {
      const subjectConnected = context.graph.appearsInAnyConstraint(obligation.subject);
      const inputChecks = obligation.requiredInputs.map((input) => context.graph.appearsInAnyConstraint(input));
      const status = subjectConnected ? statusCounts(inputChecks.length > 0 ? inputChecks : [subjectConnected]) : "missing";
      return result(
        obligation,
        status,
        subjectConnected ? [`${obligation.subject} appears in parsed constraints`] : [],
        obligation.requiredInputs.filter((input, index) => !inputChecks[index]),
        status === "satisfied"
          ? "The inferred binding obligation is supported by parsed constraints."
          : status === "partially_satisfied"
            ? "Some inferred inputs are connected, but the full binding relation was not established."
            : "The inferred binding relation is missing or not visible to static analysis."
      );
    }

    if (obligation.type === "ec_multiplication") {
      const relevantFlows = taintFlows.filter((flow) => flow.risk === "ec_unconnected_coordinate" && flow.sourceLocation?.file === obligation.sourceLocation.file);
      const required = obligation.requiredInputs.length > 0 ? obligation.requiredInputs : relevantFlows.map((flow) => flow.sink);
      const connected = required.map((name) => {
        const flow = relevantFlows.find((candidate) => candidate.sink === name || candidate.sink.includes(name) || name.includes(candidate.sink));
        return flow ? flow.constrained : true;
      });
      const status = statusCounts(connected);
      return result(
        obligation,
        status,
        relevantFlows.filter((flow) => flow.constrained).map((flow) => `${flow.sink}: ${flow.support.join(", ")}`),
        relevantFlows.filter((flow) => !flow.constrained).map((flow) => flow.sink),
        status === "satisfied"
          ? "EC multiplication-related assignments appear connected to parsed constraints."
          : status === "partially_satisfied"
            ? "The EC multiplication relation is partially supported, but some coordinates or inputs are unconnected."
            : "The EC multiplication relation is missing critical connections between assigned values and constraints."
      );
    }

    return result(obligation, "unknown", [], obligation.requiredInputs, "No relation checker is available for this obligation type.");
  });
}

export function summarizeRelationChecks(checks: RelationCheckResult[]) {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { total: checks.length, satisfied: 0, partially_satisfied: 0, missing: 0, unknown: 0 }
  );
}
