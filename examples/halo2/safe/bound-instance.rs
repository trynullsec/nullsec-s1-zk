use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Instance};

struct Config {
    advice: Column<Advice>,
    instance: Column<Instance>,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> Config {
    let advice = meta.advice_column();
    let instance = meta.instance_column();
    meta.enable_equality(advice);
    meta.enable_equality(instance);
    meta.create_gate("public input relation", |meta| {
        let a = meta.query_advice(advice, Rotation::cur());
        let public = meta.query_instance(instance, Rotation::cur());
        vec![a - public]
    });
    Config { advice, instance }
}

fn expose_public(layouter: &mut impl Layouter<Fp>, config: Config, cell: AssignedCell<Fp, Fp>) {
    layouter.constrain_instance(cell.cell(), config.instance, 0)?;
}
