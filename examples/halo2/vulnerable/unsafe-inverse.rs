use halo2_proofs::plonk::{Advice, Column, ConstraintSystem};

struct Config {
    denominator: Column<Advice>,
    inverse: Column<Advice>,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> Config {
    let denominator = meta.advice_column();
    let inverse = meta.advice_column();
    Config { denominator, inverse }
}

fn synthesize(config: Config, mut layouter: impl Layouter<Fp>) {
    layouter.assign_region(|| "unsafe inverse", |mut region| {
        let inv = witness.denominator.invert().unwrap();
        region.assign_advice(|| "inverse", config.inverse, 0, || Value::known(inv))?;
        Ok(())
    });
}
