# Nullsec S1-ZK Rules

Each rule reports a deterministic static-analysis finding. Severity can be overridden in `.nullsec-zk.json`.

## NS-ZK-001 Dangerous Hint Assignment

Severity: CRITICAL when unconstrained, MEDIUM when later constrained.

Detects Circom `<--` assignments. These compute witness values without creating constraints.

Vulnerable: `x <-- a * b;`

Safe: `x <== a * b;` or `x <-- a * b; x === a * b;`

Limitations: The rule cannot fully prove the later constraint is semantically equivalent to the hint expression.

## NS-ZK-002 Assigned But Unconstrained

Severity: CRITICAL.

Detects signals assigned with `<--` that never appear in constraints.

Vulnerable: `commitment <-- hasher.out;`

Safe: `commitment <== hasher.out;`

Limitations: Best-effort parser support may miss constraints hidden in unsupported syntax.

## NS-ZK-003 Unbound Input Signal

Severity: HIGH.

Detects `signal input` declarations that never appear in constraints.

Vulnerable: `signal input root;` with no later relation to `root`.

Safe: `root === computedRoot;`

Limitations: v1 treats all input signals as important and does not infer protocol-level public/private intent beyond syntax.

## NS-ZK-004 Unconstrained Output

Severity: HIGH or CRITICAL.

Detects outputs assigned unsafely or never referenced in constraints.

Vulnerable: `signal output out; out <-- value;`

Safe: `out <== value;`

Limitations: It checks parsed constraint participation, not full semantic derivation.

## NS-ZK-005 Missing Booleanity

Severity: HIGH.

Detects boolean-like names such as `isAdmin`, `enabled`, `selector`, `pathIndex`, or `flag` without booleanity constraints.

Vulnerable: `out <== isAdmin * balance;`

Safe: `isAdmin * (isAdmin - 1) === 0;`

Limitations: Naming heuristics can produce false positives or miss domain-specific boolean names.

## NS-ZK-006 Missing Range Check

Severity: confidence-scored and context-aware.

Primary targets: `amount`, `balance`, `fee`, `nonce`, `index`, `timestamp`, `quantity`, `count`, `size`, and `limb`.

The rule distinguishes bounded integers from hash-like values such as `nullifierHash`, `commitment`, and Merkle `root` signals. Hash outputs, commitments, roots, and nullifier hashes are not automatically required to have range checks unless they are used as bounded integers in arithmetic or comparators.

Confidence examples:

- `amount` input without range check: HIGH confidence, HIGH severity
- `balance` input without range check: HIGH confidence, HIGH severity
- `nullifierHash` equality binding: not reported
- `commitment` from Poseidon output: not reported
- `remainingBalance` with range-checked operands: not reported

Vulnerable: `remaining <== balance - amount;` flags `amount` and `balance` inputs.

Safe: `component bits = Num2Bits(64); bits.in <== amount;`

Limitations: Classification is heuristic. It recognizes common range gadgets and patterns, not every custom range proof or protocol-specific integer encoding.

## NS-ZK-007 Unsafe Assertion

Severity: HIGH.

Detects `assert(...)` expressions involving signals.

Vulnerable: `assert(secret === expected);`

Safe: `secret === expected;`

Limitations: Constant assertions and template parameter assertions may be legitimate; the rule focuses on signal references.

## NS-ZK-008 Unsafe Division Or Inverse

Severity: HIGH or MEDIUM.

Detects division, inverse, `inv`, and `IsZero`-like patterns without clear nonzero guards.

Vulnerable: `q <-- numerator / denominator;`

Safe: `denominator * inverse === 1; q <== numerator * inverse;`

Limitations: Custom safe inversion gadgets may require project-specific rule configuration.

## NS-ZK-009 Unconstrained Component Output

Severity: CRITICAL.

Detects component outputs copied through `<--` and not constrained.

Vulnerable: `commitment <-- h.out;`

Safe: `commitment <== h.out;`

Limitations: Component output names are inferred from references and common Circom conventions.

## NS-ZK-010 Alias Or Overflow Risk

Severity: MEDIUM or HIGH.

Detects wide bit decompositions near BN254 field size and unbounded limb arrays.

Vulnerable: `component bits = Num2Bits(254);` without `AliasCheck`.

Safe: Use field-safe bit widths and add `AliasCheck` for large decompositions.

Limitations: Reports confidence MEDIUM or LOW where intent is ambiguous.

## NS-ZK-011 Unused Signal

Severity: LOW.

Detects declared signals that are never assigned and never constrained.

Vulnerable: `signal unused;`

Safe: Remove dead signals or add the intended constraints.

Limitations: Some generated templates may intentionally declare unused compatibility signals.

## NS-ZK-012 Suspicious Selector

Severity: HIGH.

Detects selector-like signals used in conditional arithmetic without booleanity checks.

Vulnerable: `out <== selector * a + (1 - selector) * b;`

Safe: `selector * (selector - 1) === 0;`

Limitations: Selector naming and multiplexer detection are heuristic.

## NS-H2-001 Assigned Advice Not Constrained

Severity: HIGH or CRITICAL depending context.

Detects Halo2 `assign_advice` calls that do not appear connected through the Halo2 constraint graph to parsed `create_gate` expressions, equality edges, copy constraints, `constrain_instance`, or lookups.

Vulnerable: assigning an advice cell in a region without referencing it in a gate or equality/public binding.

Safe: reference the assigned cell in a gate, lookup, copy constraint, or instance exposure as intended.

Limitations: This is graph-aware Rust source scanning, not full Halo2 synthesis tracing.

## NS-H2-002 Instance Value Not Bound

Severity: HIGH.

Detects `query_instance` usage that is not connected through a gate expression or public instance binding.

Vulnerable: querying or intending to use a public instance value without connecting an assigned cell to the public statement.

Safe: use `layouter.constrain_instance(cell.cell(), config.instance, row)`.

Limitations: Cross-file helper abstractions may require suppression or future interprocedural analysis.

## NS-H2-003 Selector Discipline Risk

Severity: MEDIUM or HIGH.

Detects selectors queried in gates, especially selector multipliers, without clear `.enable(...)` usage in parsed regions.

Vulnerable: `meta.query_selector(q_gate)` appears in a gate, but no region enables `q_gate`.

Safe: enable the selector on every row where the gate must apply.

Limitations: Complex selector abstractions may not be recognized.

## NS-H2-004 Unsafe Inverse Or Division

Severity: HIGH.

Detects `.invert()`, `.inverse()`, or division-like code without an obvious nearby zero check, nonzero guard, safe gadget, or inverse relation. Apparent safe patterns are downgraded for review instead of treated as fully proven safe.

Vulnerable: `let inv = denominator.invert().unwrap();`

Safe: guard zero explicitly and constrain the inverse relation in a gate.

Limitations: The guard detector is local and heuristic.

## NS-H2-005 Partial Elliptic-Curve Operation Risk

Severity: HIGH, confidence MEDIUM unless obvious.

Detects EC-related assignments involving names like `curve`, `point`, `scalar`, `base`, `fixed_base`, `variable_base`, `ecc`, or `mul` that are not connected to gate expressions, equality edges, copy constraints, lookups, or public instance bindings.

Vulnerable: assigning EC point coordinates from a scalar multiplication without constraining the group law.

Safe: bind every EC intermediate through complete gate constraints, lookups, or equality constraints.

Limitations: This rule is intentionally conservative for Orchard-class research and may require project-specific tuning.

## NS-H2-006 Missing Enable Equality

Severity: MEDIUM.

Detects `constrain_equal` usage where the graph cannot connect the copy constraint to a parsed column with obvious `meta.enable_equality(...)`.

Vulnerable: calling `constrain_equal` on cells from columns not configured for equality.

Safe: call `meta.enable_equality` for advice or instance columns participating in copy constraints.

Limitations: The rule depends on local column extraction and may miss wrapper APIs.
