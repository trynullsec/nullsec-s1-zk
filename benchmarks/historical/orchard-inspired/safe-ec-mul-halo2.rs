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
    meta.enable_equality(base_x);
    meta.enable_equality(base_y);
    meta.enable_equality(scalar);
    meta.enable_equality(acc_x);
    meta.enable_equality(acc_y);
    meta.enable_equality(out_x);
    meta.enable_equality(out_y);

    meta.create_gate("complete synthetic orchard ec mul relation", |meta| {
        let s = meta.query_selector(q_ec_mul);
        let bx = meta.query_advice(base_x, Rotation::cur());
        let by = meta.query_advice(base_y, Rotation::cur());
        let scalar = meta.query_advice(scalar, Rotation::cur());
        let ax = meta.query_advice(acc_x, Rotation::cur());
        let ay = meta.query_advice(acc_y, Rotation::cur());
        let ox = meta.query_advice(out_x, Rotation::cur());
        let oy = meta.query_advice(out_y, Rotation::cur());
        vec![
            s.clone() * (ax + bx * scalar - ox),
            s.clone() * (ay + by * scalar - oy),
            s * (by * by - bx * bx * bx),
        ]
    });

    EcMulConfig { base_x, base_y, scalar, acc_x, acc_y, out_x, out_y, q_ec_mul }
}

fn synthesize(config: EcMulConfig, mut layouter: impl Layouter<Fp>) {
    layouter.assign_region(|| "orchard inspired complete ec mul", |mut region| {
        config.q_ec_mul.enable(&mut region, 0)?;
        let base_x_cell = region.assign_advice(|| "base x", config.base_x, 0, || Value::known(base_point.x))?;
        let base_y_cell = region.assign_advice(|| "base y", config.base_y, 0, || Value::known(base_point.y))?;
        let scalar_cell = region.assign_advice(|| "scalar", config.scalar, 0, || Value::known(scalar))?;
        let acc_x_cell = region.assign_advice(|| "accumulator x", config.acc_x, 0, || Value::known(acc.x))?;
        let acc_y_cell = region.assign_advice(|| "accumulator y", config.acc_y, 0, || Value::known(acc.y))?;
        let out_x_cell = region.assign_advice(|| "output point x", config.out_x, 0, || Value::known(output.x))?;
        let out_y_cell = region.assign_advice(|| "output point y", config.out_y, 0, || Value::known(output.y))?;
        region.constrain_equal(base_x_cell.cell(), base_x_cell.cell())?;
        region.constrain_equal(base_y_cell.cell(), base_y_cell.cell())?;
        region.constrain_equal(scalar_cell.cell(), scalar_cell.cell())?;
        region.constrain_equal(acc_x_cell.cell(), acc_x_cell.cell())?;
        region.constrain_equal(acc_y_cell.cell(), acc_y_cell.cell())?;
        region.constrain_equal(out_x_cell.cell(), out_x_cell.cell())?;
        region.constrain_equal(out_y_cell.cell(), out_y_cell.cell())?;
        Ok(())
    });
}
