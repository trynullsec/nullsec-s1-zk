# Limitations

Nullsec S1-ZK v1 is deterministic static analysis for ZK circuit auditing. It is intentionally precise about what it can and cannot claim.

- Static analysis is approximate and may produce false positives.
- The Circom parser is best-effort; unsupported syntax records parser warnings where possible.
- The Halo2 frontend is best-effort Rust source scanning. It is not a full Rust AST, MIR, or Halo2 synthesis analyzer.
- The Halo2 constraint graph is approximate. It links obvious gates, regions, advice assignments, selector enables, equality/copy edges, lookups, and instance bindings, but it does not execute synthesis code.
- It is not full formal verification and does not prove circuit soundness.
- The `--deep` proof obligation layer infers likely obligations from naming, graph relationships, and source structure. These inferred obligations may be wrong, incomplete, or project-specific.
- Exploit hypotheses are deterministic audit aids, not generated counterexamples and not proof of exploitability.
- It may miss semantic bugs that require protocol context, cross-circuit reasoning, or full compilation.
- It does not generate witnesses or counterexamples yet.
- It does not compile Circom circuits, inspect generated R1CS, or run Halo2 circuit synthesis yet.
- Halo2 findings may miss behavior hidden behind macros, helper APIs, generics, cross-file abstractions, or dynamic region assignment patterns.
- Macro-heavy Rust and project-specific Halo2 gadget APIs may require future parser support or rule tuning.
- Range-check and booleanity detection recognize common patterns, not every custom gadget.
- Component output inference is heuristic and based on parsed references.
- AI-native modules prepare prompts for future reasoning but do not call external AI APIs.
