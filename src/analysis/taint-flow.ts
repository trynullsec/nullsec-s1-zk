import { Halo2ConstraintGraph } from "../frontends/halo2/halo2-constraint-graph.js";
import type { AuditContext, TaintFlowPath } from "../types.js";

function idFor(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

export function analyzeTaintFlow(context: AuditContext): TaintFlowPath[] {
  const flows: TaintFlowPath[] = [];

  for (const assignment of context.ir.assignments) {
    const sinkLike = /commit|nullifier|root|out|output/i.test(assignment.lhs);
    if (!sinkLike) continue;
    const constrained = context.graph.appearsInAnyConstraint(assignment.lhs);
    flows.push({
      id: idFor("TF-CIRCOM", flows.length),
      source: assignment.rhs,
      sink: assignment.lhs,
      path: [assignment.rhs, assignment.lhs],
      constrained,
      support: constrained ? context.graph.constraintsForSignal(assignment.lhs).map((constraint) => constraint.expression) : [],
      risk: "untrusted_to_output",
      confidence: constrained ? "MEDIUM" : "HIGH",
      sourceLocation: assignment
    });
  }

  if (context.halo2) {
    const graph = new Halo2ConstraintGraph(context.halo2);
    for (const assignment of context.halo2.assignments) {
      const label = assignment.label ?? assignment.columnName ?? assignment.target ?? "unknown";
      const sinkLike = /commit|nullifier|root|output|out|point|base|scalar|accumulator|x|y/i.test(label);
      if (!sinkLike) continue;
      const support = graph.assignmentConnections(assignment);
      flows.push({
        id: idFor("TF-HALO2", flows.length),
        source: assignment.assignedVariable ?? assignment.expression,
        sink: label,
        path: [assignment.assignedVariable ?? assignment.expression, label],
        constrained: support.length > 0,
        support,
        risk: /point|base|scalar|accumulator|x|y/i.test(label) ? "ec_unconnected_coordinate" : "untrusted_to_output",
        confidence: support.length > 0 ? "MEDIUM" : "HIGH",
        sourceLocation: assignment
      });
    }

    for (const binding of context.halo2.instanceConstraints) {
      flows.push({
        id: idFor("TF-HALO2-PUBLIC", flows.length),
        source: binding.cell,
        sink: binding.instanceColumn,
        path: [binding.cell, binding.instanceColumn],
        constrained: true,
        support: [binding.snippet ?? "constrain_instance"],
        risk: "public_binding_without_relation",
        confidence: "MEDIUM",
        sourceLocation: binding
      });
    }
  }

  return flows;
}
