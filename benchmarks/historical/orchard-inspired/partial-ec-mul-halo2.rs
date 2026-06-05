use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Selector};

struct EcMulConfig {
    base_x: Column<Advice>,
    base_y: Column<Advice>,
    scalar: Column<Advice>,
    acc_x: Column<Advice>,
    acc_y: Column<Advice>,
    out_x: Column<Advice>,
    out_y: Column<Advice>,
    q_ec_mul: Selector,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> EcMulConfig {
    let base_x = meta.advice_column();
    let base_y = meta.advice_column();
    let scalar = meta.advice_column();
    let acc_x = meta.advice_column();
    let acc_y = meta.advice_column();
    let out_x = meta.advice_column();
    let out_y = meta.advice_column();
    let q_ec_mul = meta.selector();

    meta.create_gate("synthetic orchard ec mul relation", |meta| {
        let s = meta.query_selector(q_ec_mul);
        let bx = meta.query_advice(base_x, Rotation::cur());
        let scalar = meta.query_advice(scalar, Rotation::cur());
        let ax = meta.query_advice(acc_x, Rotation::cur());
        let ay = meta.query_advice(acc_y, Rotation::cur());
        let ox = meta.query_advice(out_x, Rotation::cur());
        let oy = meta.query_advice(out_y, Rotation::cur());
        vec![
            s.clone() * (ax + bx * scalar - ox),
            s * (ay + scalar - oy),
        ]
    });

    EcMulConfig { base_x, base_y, scalar, acc_x, acc_y, out_x, out_y, q_ec_mul }
}

fn synthesize(config: EcMulConfig, mut layouter: impl Layouter<Fp>) {
    layouter.assign_region(|| "orchard inspired partial ec mul", |mut region| {
        config.q_ec_mul.enable(&mut region, 0)?;
        region.assign_advice(|| "base x", config.base_x, 0, || Value::known(base_point.x))?;
        region.assign_advice(|| "base y", config.base_y, 0, || Value::known(base_point.y))?;
        region.assign_advice(|| "scalar", config.scalar, 0, || Value::known(scalar))?;
        region.assign_advice(|| "accumulator x", config.acc_x, 0, || Value::known(acc.x))?;
        region.assign_advice(|| "accumulator y", config.acc_y, 0, || Value::known(acc.y))?;
        region.assign_advice(|| "output point x", config.out_x, 0, || Value::known(output.x))?;
        region.assign_advice(|| "output point y", config.out_y, 0, || Value::known(output.y))?;
        Ok(())
    });
}
