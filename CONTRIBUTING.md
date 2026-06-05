# Contributing

Thanks for helping improve Nullsec S1-ZK.

## Development

```bash
npm install
npm run build
npm test
npm run benchmark
```

## Rule Contributions

Every new rule should include:

- Rule implementation.
- Vulnerable fixture.
- Safe fixture when practical.
- Test coverage.
- `RULES.md` documentation.

Rule naming:

- `NS-ZK-*` for generic or Circom ZK rules.
- `NS-H2-*` for Halo2 rules.

## Notes

Keep findings precise and avoid formal-verification claims unless the implementation actually proves a property. Prefer deterministic static-analysis evidence, clear confidence levels, and honest limitations.
