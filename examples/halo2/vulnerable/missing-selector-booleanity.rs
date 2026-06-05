use halo2_proofs::plonk::{Advice, Column, ConstraintSystem, Selector};

struct Config {
    lhs: Column<Advice>,
    rhs: Column<Advice>,
    q_swap: Selector,
}

fn configure(meta: &mut ConstraintSystem<Fp>) -> Config {
    let lhs = meta.advice_column();
    let rhs = meta.advice_column();
    let q_swap = meta.selector();
    meta.create_gate("conditional swap", |meta| {
        let s = meta.query_selector(q_swap);
        let a = meta.query_advice(lhs, Rotation::cur());
        let b = meta.query_advice(rhs, Rotation::cur());
        vec![s.clone() * (a - b)]
    });
    Config { lhs, rhs, q_swap }
}
