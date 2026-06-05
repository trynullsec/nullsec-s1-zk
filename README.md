# Nullsec S1-ZK

AI-native auditing for zero-knowledge circuits. Find underconstraints before they mint infinite money.

## What Nullsec S1-ZK Is

Nullsec S1-ZK is a production-grade static analysis foundation for ZK circuit auditing. It scans Circom circuits for high-impact soundness risks such as unsafe witness hints, missing constraints, missing range checks, missing booleanity checks, unbound inputs, unsafe assertions, and component output binding mistakes.

It detects high-signal underconstraint patterns, but it does not prove full circuit soundness and does not replace expert cryptographic audits.

## Why ZK Underconstraints Matter

Most catastrophic ZK bugs are not ordinary application bugs. They are proof-system semantic failures where the circuit does not actually constrain what the protocol thinks it constrains. Nullsec S1-ZK is built around the question: what does this circuit claim to prove, and what does it actually constrain?

## What v1 Detects

v1 implements deterministic static analysis for Circom:

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

## Installation

```bash
npm install
npm run build
npm link
```

## Usage

```bash
nullsec-zk scan ./examples
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
Frontend: Circom
Files scanned: 15
Rules executed: 12
Issues found: 9
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

Static analysis is approximate. The v1 parser is Circom-focused, does not compile circuits, does not generate witnesses, and does not perform formal verification. See `LIMITATIONS.md`.

## Roadmap

Future work includes Halo2, Noir, gnark, Plonky2, R1CS extraction, witness counterexample generation, spec-to-circuit comparison, LLM-assisted exploit reasoning, CI integrations, and hosted reporting. See `ROADMAP.md`.

## Security Philosophy

Nullsec S1-ZK treats ZK circuit bugs as proof semantics failures. It is designed to surface places where witness values, public claims, outputs, selectors, and integer domains are not bound by constraints in the way a protocol likely intends.
