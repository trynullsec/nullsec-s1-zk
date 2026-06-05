use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Instance};

struct Config {
    advice: Column<Advice>,
    instance: Column<Instance>,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> Config {
    let advice = meta.advice_column();
    let instance = meta.instance_column();
    Config { advice, instance }
}

fn synthesize(config: Config, mut layouter: impl Layouter<Fp>) {
    let public = meta.query_instance(config.instance, Rotation::cur());
    layouter.assign_region(|| "unbound public value", |mut region| {
        region.assign_advice(|| "private copy", config.advice, 0, || Value::known(witness))?;
        Ok(())
    });
}
