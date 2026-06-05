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

Severity: MEDIUM by default, HIGH for high-value inputs/outputs.

Detects numeric-like names such as `amount`, `balance`, `nonce`, `limb`, `nullifier`, and `root` without obvious range-check patterns.

Vulnerable: `remaining <== balance - amount;`

Safe: `component bits = Num2Bits(64); bits.in <== amount;`

Limitations: It recognizes common range gadgets and patterns, not every custom range proof.

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
