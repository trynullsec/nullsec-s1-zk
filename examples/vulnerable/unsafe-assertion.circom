pragma circom 2.1.0;

template AssertSecret() {
  signal input secret;
  signal input expected;
  signal output ok;

  assert(secret === expected);
  ok <== 1;
}

component main = AssertSecret();
