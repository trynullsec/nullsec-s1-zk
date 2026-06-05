# Limitations

Nullsec S1-ZK v1 is deterministic static analysis for ZK circuit auditing. It is intentionally precise about what it can and cannot claim.

- Static analysis is approximate and may produce false positives.
- The parser is Circom-focused and best-effort; unsupported syntax records parser warnings where possible.
- It is not full formal verification and does not prove circuit soundness.
- It may miss semantic bugs that require protocol context, cross-circuit reasoning, or full compilation.
- It does not generate witnesses or counterexamples yet.
- It does not compile Circom circuits or inspect generated R1CS yet.
- Range-check and booleanity detection recognize common patterns, not every custom gadget.
- Component output inference is heuristic and based on parsed references.
- AI-native modules prepare prompts for future reasoning but do not call external AI APIs.
