pragma circom 2.1.0;

template SafeDivision() {
  signal input numerator;
  signal input denominator;
  signal output quotient;
  signal inverse;

  inverse <-- 1 / denominator;
  denominator * inverse === 1;
  quotient <== numerator * inverse;
}

component main = SafeDivision();
