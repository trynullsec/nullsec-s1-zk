use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Selector};

struct Config {
    value: Column<Advice>,
    q_enable: Selector,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> Config {
    let value = meta.advice_column();
    let q_enable = meta.selector();
    meta.create_gate("unrelated gate", |meta| {
        let s = meta.query_selector(q_enable);
        vec![s]
    });
    Config { value, q_enable }
}

fn synthesize(config: Config, mut layouter: impl Layouter<Fp>) {
    layouter.assign_region(|| "unconstrained witness", |mut region| {
        config.q_enable.enable(&mut region, 0)?;
        region.assign_advice(|| "secret amount", config.value, 0, || Value::known(secret_amount))?;
        Ok(())
    });
}
