# Nullsec S1-ZK

AI-native auditing for zero-knowledge circuits. Find underconstraints before they mint infinite money.

## What Nullsec S1-ZK Is

Nullsec S1-ZK is a production-grade static analysis foundation for ZK circuit auditing. It scans Circom circuits and Rust-based Halo2 circuits for high-impact soundness risks such as unsafe witness hints, missing constraints, missing range checks, missing booleanity checks, unbound inputs, unsafe assertions, component output binding mistakes, unconstrained advice assignments, and unbound Halo2 instance values.

It detects high-signal underconstraint patterns, but it does not prove full circuit soundness and does not replace expert cryptographic audits.

## Why ZK Underconstraints Matter

Most catastrophic ZK bugs are not ordinary application bugs. They are proof-system semantic failures where the circuit does not actually constrain what the protocol thinks it constrains. Nullsec S1-ZK is built around the question: what does this circuit claim to prove, and what does it actually constrain?

## What v1 Detects

v1 implements deterministic static analysis for Circom and best-effort static analysis for Halo2-style Rust circuits.

Circom checks include:

- Dangerous `<--` hint assignments.
- Assigned but unconstrained signals.
- Input signals that never bind into constraints.
- Unconstrained outputs.
- Missing booleanity checks.
- Missing range checks and aliasing risks.
- Unsafe `assert(...)` over signals.
- Unsafe division and inverse patterns.
- Unconstrained component outputs.
- Unused signals and suspicious selectors.

Halo2 checks include:

- Advice assignments that do not appear connected to gates, equality constraints, instance constraints, or lookups.
- Instance/public values queried without an obvious public binding.
- Selector discipline risks.
- Unsafe inverse or division patterns.
- Suspicious partial elliptic-curve operation assignments.
- Copy-constraint usage without obvious `enable_equality`.

## Halo2 Constraint Graph

The Halo2 frontend builds a best-effort constraint graph from Rust source. It links `create_gate` expressions, advice/fixed/instance queries, selector-gated polynomials, `assign_region` assignments, selector enables, `constrain_equal`, `copy_advice`, lookups, and `constrain_instance` public bindings.

This graph lets Nullsec S1-ZK distinguish advice values that are connected through gates, equality edges, lookups, or public instance exposure from values that are merely assigned in a region. It improves high-signal findings for Orchard-style EC gadgets and other Halo2 circuits, but it is still static source analysis, not formal verification or complete Halo2 synthesis.

## Installation

```bash
npm install
npm run build
npm link
```

## Usage

```bash
nullsec-zk scan ./examples
nullsec-zk scan ./examples/halo2
nullsec-zk scan ./examples --format json
nullsec-zk scan ./examples --format sarif
nullsec-zk scan ./examples --report markdown
nullsec-zk scan ./examples --out report.json
nullsec-zk scan ./examples --fail-on HIGH
nullsec-zk rules
nullsec-zk explain NS-ZK-001
```

## Example Terminal Output

```text
Nullsec S1-ZK
AI-native auditing for zero-knowledge circuits

Target: ./examples
Frontend: Mixed
Files scanned: 24
Rules executed: 18
Issues found: 33
```

## JSON Output

JSON output includes the tool name, version, target, files scanned, rules executed, severity counts, issues, and parser warnings.

```bash
nullsec-zk scan ./examples --format json
```

## Markdown Reports

```bash
nullsec-zk scan ./examples --report markdown
```

By default this writes `nullsec-zk-report.md`. Use `--out` to choose another path.

## SARIF / CI Usage

```bash
nullsec-zk scan ./circuits --format sarif --out nullsec-zk.sarif --fail-on HIGH
```

The SARIF renderer is structured for GitHub code scanning compatibility.

## Rule List

Run:

```bash
nullsec-zk rules
```

Detailed rule documentation is in `RULES.md`.

## Configuration

Create a config:

```bash
nullsec-zk init
```

Example:

```json
{
  "rules": {
    "NS-ZK-006": "off",
    "NS-ZK-005": "high"
  },
  "ignore": ["node_modules", "circomlib"],
  "failOn": "HIGH",
  "format": "terminal",
  "field": "BN254"
}
```

## Limitations

Static analysis is approximate. The Circom and Halo2 frontends are best-effort source analyzers, do not compile circuits, do not generate witnesses, and do not perform formal verification. See `LIMITATIONS.md`.

## Roadmap

Future work includes deeper Halo2 analysis, Noir, gnark, Plonky2, R1CS extraction, witness counterexample generation, spec-to-circuit comparison, LLM-assisted exploit reasoning, CI integrations, and hosted reporting. See `ROADMAP.md`.

## Security Philosophy

Nullsec S1-ZK treats ZK circuit bugs as proof semantics failures. It is designed to surface places where witness values, public claims, outputs, selectors, and integer domains are not bound by constraints in the way a protocol likely intends.
