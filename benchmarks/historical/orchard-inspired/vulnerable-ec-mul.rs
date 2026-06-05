use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Selector};

// Synthetic Orchard-class benchmark.
//
// This file is not Zcash source code and does not reproduce the original
// Orchard exploit. It models the same family of risk: an EC multiplication
// gadget where assigned elliptic-curve values are not fully bound into the
// Halo2 constraint system.

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

    meta.create_gate("synthetic incomplete ec multiplication", |meta| {
        let s = meta.query_selector(q_ec_mul);
        let bx = meta.query_advice(base_x, Rotation::cur());
        let k = meta.query_advice(scalar, Rotation::cur());
        let acc_x = meta.query_advice(accumulator_x, Rotation::cur());
        let acc_y = meta.query_advice(accumulator_y, Rotation::cur());
        let out_x = meta.query_advice(output_x, Rotation::cur());

        // Vulnerable model:
        // - base_y is assigned below but not queried here.
        // - output_y is assigned below but not queried here.
        // The parsed graph can connect base_x/scalar/accumulator/output_x, but
        // cannot connect the omitted y-coordinate relation.
        vec![
            s.clone() * (acc_x + bx * k - out_x),
            s * (acc_y + k - out_x),
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
    layouter.assign_region(|| "synthetic orchard-class vulnerable ec mul", |mut region| {
        config.q_ec_mul.enable(&mut region, 0)?;
        region.assign_advice(|| "base point x", config.base_x, 0, || Value::known(base_point.x))?;
        region.assign_advice(|| "base point y", config.base_y, 0, || Value::known(base_point.y))?;
        region.assign_advice(|| "scalar", config.scalar, 0, || Value::known(scalar))?;
        region.assign_advice(|| "accumulator x", config.accumulator_x, 0, || Value::known(accumulator.x))?;
        region.assign_advice(|| "accumulator y", config.accumulator_y, 0, || Value::known(accumulator.y))?;
        region.assign_advice(|| "output point x", config.output_x, 0, || Value::known(output.x))?;
        region.assign_advice(|| "output point y", config.output_y, 0, || Value::known(output.y))?;
        Ok(())
    });
}
