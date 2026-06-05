# Halo2 Frontend

Nullsec S1-ZK includes best-effort static analysis support for Rust-based Halo2 circuits.

The frontend scans Rust source for high-signal Halo2 patterns such as `ConstraintSystem`, `create_gate`, `query_advice`, `query_instance`, `assign_advice`, `constrain_equal`, `constrain_instance`, selectors, lookups, and equality-enabled columns.

This is not a Rust compiler frontend and does not claim complete Halo2 soundness checking. It is designed to surface suspicious advice assignments, public instance binding issues, selector discipline risks, unsafe inversions, incomplete elliptic-curve operations, and missing `enable_equality` patterns for expert review.
