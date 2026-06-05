pragma circom 2.1.0;

template AliasRisk() {
  signal input value;
  signal output out;

  component bits = Num2Bits(254);
  bits.in <== value;
  out <== value;
}

component main = AliasRisk();
