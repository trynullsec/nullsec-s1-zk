pragma circom 2.1.0;

template SafeBoolean() {
  signal input isAdmin;
  signal input balance;
  signal output allowedAmount;

  isAdmin * (isAdmin - 1) === 0;
  allowedAmount <== isAdmin * balance;
}

component main = SafeBoolean();
