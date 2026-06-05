use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Selector};

// Synthetic Orchard-class fixed control case.
//
// This file is not Zcash source code. It mirrors the vulnerable benchmark's
// shape, but every assigned EC value is connected through parsed gate
// expressions and equality edges.

struct EcMulConfig {
    base_x: Column<Advice>,
    base_y: Column<Advice>,
    scalar: Column<Advice>,
    accumulator_x: Column<Advice>,
    accumulator_y: Column<Advice>,
    output_x: Column<Advice>,
    output_y: Column<Advice>,
    q_ec_mul: Selector,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> EcMulConfig {
    let base_x = meta.advice_column();
    let base_y = meta.advice_column();
    let scalar = meta.advice_column();
    let accumulator_x = meta.advice_column();
    let accumulator_y = meta.advice_column();
    let output_x = meta.advice_column();
    let output_y = meta.advice_column();
    let q_ec_mul = meta.selector();

    meta.enable_equality(base_x);
    meta.enable_equality(base_y);
    meta.enable_equality(scalar);
    meta.enable_equality(accumulator_x);
    meta.enable_equality(accumulator_y);
    meta.enable_equality(output_x);
    meta.enable_equality(output_y);

    meta.create_gate("synthetic complete ec multiplication", |meta| {
        let s = meta.query_selector(q_ec_mul);
        let bx = meta.query_advice(base_x, Rotation::cur());
        let by = meta.query_advice(base_y, Rotation::cur());
        let k = meta.query_advice(scalar, Rotation::cur());
        let acc_x = meta.query_advice(accumulator_x, Rotation::cur());
        let acc_y = meta.query_advice(accumulator_y, Rotation::cur());
        let out_x = meta.query_advice(output_x, Rotation::cur());
        let out_y = meta.query_advice(output_y, Rotation::cur());

        vec![
            s.clone() * (acc_x + bx * k - out_x),
            s.clone() * (acc_y + by * k - out_y),
            s * (by * by - bx * bx * bx),
        ]
    });

    EcMulConfig {
        base_x,
        base_y,
        scalar,
        accumulator_x,
        accumulator_y,
        output_x,
        output_y,
        q_ec_mul,
    }
}

fn synthesize(config: EcMulConfig, mut layouter: impl Layouter<Fp>) {
    layouter.assign_region(|| "synthetic orchard-class fixed ec mul", |mut region| {
        config.q_ec_mul.enable(&mut region, 0)?;
        let base_x_cell = region.assign_advice(|| "base point x", config.base_x, 0, || Value::known(base_point.x))?;
        let base_y_cell = region.assign_advice(|| "base point y", config.base_y, 0, || Value::known(base_point.y))?;
        let scalar_cell = region.assign_advice(|| "scalar", config.scalar, 0, || Value::known(scalar))?;
        let acc_x_cell = region.assign_advice(|| "accumulator x", config.accumulator_x, 0, || Value::known(accumulator.x))?;
        let acc_y_cell = region.assign_advice(|| "accumulator y", config.accumulator_y, 0, || Value::known(accumulator.y))?;
        let out_x_cell = region.assign_advice(|| "output point x", config.output_x, 0, || Value::known(output.x))?;
        let out_y_cell = region.assign_advice(|| "output point y", config.output_y, 0, || Value::known(output.y))?;

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
