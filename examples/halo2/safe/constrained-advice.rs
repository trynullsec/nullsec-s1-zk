use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Selector};

struct Config {
    value: Column<Advice>,
    q_enable: Selector,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> Config {
    let value = meta.advice_column();
    meta.enable_equality(value);
    let q_enable = meta.selector();
    meta.create_gate("value is constrained", |meta| {
        let s = meta.query_selector(q_enable);
        let v = meta.query_advice(value, Rotation::cur());
        vec![s * v]
    });
    Config { value, q_enable }
}

fn synthesize(config: Config, mut layouter: impl Layouter<Fp>) {
    layouter.assign_region(|| "constrained witness", |mut region| {
        config.q_enable.enable(&mut region, 0)?;
        let cell = region.assign_advice(|| "value", config.value, 0, || Value::known(value))?;
        region.constrain_equal(cell.cell(), cell.cell())?;
        Ok(())
    });
}
