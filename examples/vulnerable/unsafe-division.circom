pragma circom 2.1.0;

template UnsafeDivision() {
  signal input numerator;
  signal input denominator;
  signal output quotient;

  quotient <-- numerator / denominator;
}

component main = UnsafeDivision();
