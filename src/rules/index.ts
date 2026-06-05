import type { Rule } from "../types.js";
import { dangerousHintAssignmentRule } from "./NS-ZK-001-dangerous-hint-assignment.js";
import { assignedButUnconstrainedRule } from "./NS-ZK-002-assigned-but-unconstrained.js";
import { unboundPublicInputRule } from "./NS-ZK-003-unbound-public-input.js";
import { unconstrainedOutputRule } from "./NS-ZK-004-unconstrained-output.js";
import { missingBooleanityRule } from "./NS-ZK-005-missing-booleanity.js";
import { missingRangeCheckRule } from "./NS-ZK-006-missing-range-check.js";
import { unsafeAssertionRule } from "./NS-ZK-007-unsafe-assertion.js";
import { unsafeDivisionOrInverseRule } from "./NS-ZK-008-unsafe-division-or-inverse.js";
import { unconstrainedComponentOutputRule } from "./NS-ZK-009-unconstrained-component-output.js";
import { aliasOverflowRiskRule } from "./NS-ZK-010-alias-overflow-risk.js";
import { unusedSignalRule } from "./NS-ZK-011-unused-signal.js";
import { suspiciousSelectorRule } from "./NS-ZK-012-suspicious-selector.js";
import { halo2AssignedAdviceNotConstrainedRule } from "./halo2/NS-H2-001-assigned-advice-not-constrained.js";
import { halo2InstanceNotBoundRule } from "./halo2/NS-H2-002-instance-not-bound.js";
import { halo2SelectorRiskRule } from "./halo2/NS-H2-003-selector-risk.js";
import { halo2UnsafeInverseRule } from "./halo2/NS-H2-004-unsafe-inverse.js";
import { halo2PartialEcOperationRule } from "./halo2/NS-H2-005-partial-ec-operation.js";
import { halo2MissingEnableEqualityRule } from "./halo2/NS-H2-006-missing-enable-equality.js";

export const allRules: Rule[] = [
  dangerousHintAssignmentRule,
  assignedButUnconstrainedRule,
  unboundPublicInputRule,
  unconstrainedOutputRule,
  missingBooleanityRule,
  missingRangeCheckRule,
  unsafeAssertionRule,
  unsafeDivisionOrInverseRule,
  unconstrainedComponentOutputRule,
  aliasOverflowRiskRule,
  unusedSignalRule,
  suspiciousSelectorRule,
  halo2AssignedAdviceNotConstrainedRule,
  halo2InstanceNotBoundRule,
  halo2SelectorRiskRule,
  halo2UnsafeInverseRule,
  halo2PartialEcOperationRule,
  halo2MissingEnableEqualityRule
];
