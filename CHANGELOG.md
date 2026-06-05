# Changelog

## 1.0.5

### Added

- Circom frontend with tokenizer, parser, constraint graph, examples, reports, and rule coverage.
- Halo2-style Rust frontend with heuristic gate, assignment, equality, selector, lookup, and public binding extraction.
- Graph-aware Halo2 constraint analysis.
- Proof obligation deep mode.
- Deterministic exploit hypotheses.
- Orchard-inspired synthetic Halo2 benchmark.
- npm package `@trynullsec/s1-zk`.

### Changed

- README and package metadata now present the project as deterministic, graph-aware static analysis.
- Version reporting is synchronized from `package.json`.

### Fixed

- CLI/report version mismatch.
- Prompt-builder code fence language for Halo2 issues.
