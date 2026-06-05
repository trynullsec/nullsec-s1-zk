use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Selector};

struct Config {
    denominator: Column<Advice>,
    inverse: Column<Advice>,
    q_nonzero: Selector,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> Config {
    let denominator = meta.advice_column();
    let inverse = meta.advice_column();
    let q_nonzero = meta.selector();
    meta.create_gate("safe inverse", |meta| {
        let s = meta.query_selector(q_nonzero);
        let d = meta.query_advice(denominator, Rotation::cur());
        let inv = meta.query_advice(inverse, Rotation::cur());
        vec![s * (d * inv - Expression::Constant(Fp::one()))]
    });
    Config { denominator, inverse, q_nonzero }
}

fn synthesize(config: Config, mut layouter: impl Layouter<Fp>) {
    layouter.assign_region(|| "safe inverse", |mut region| {
        config.q_nonzero.enable(&mut region, 0)?;
        assert!(!witness.denominator.is_zero());
        let inv = witness.denominator.invert().unwrap();
        region.assign_advice(|| "inverse", config.inverse, 0, || Value::known(inv))?;
        Ok(())
    });
}
