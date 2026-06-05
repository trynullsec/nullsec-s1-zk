use halo2_proofs::plonk::{Advice, Column, ConstraintSystem};

struct Config {
    scalar: Column<Advice>,
    point_x: Column<Advice>,
    point_y: Column<Advice>,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> Config {
    let scalar = meta.advice_column();
    let point_x = meta.advice_column();
    let point_y = meta.advice_column();
    Config { scalar, point_x, point_y }
}

fn synthesize(config: Config, mut layouter: impl Layouter<Fp>) {
    layouter.assign_region(|| "partial ec mul", |mut region| {
        let variable_base_mul = curve_point * scalar;
        region.assign_advice(|| "ec point x", config.point_x, 0, || Value::known(variable_base_mul.x))?;
        region.assign_advice(|| "ec point y", config.point_y, 0, || Value::known(variable_base_mul.y))?;
        Ok(())
    });
}
