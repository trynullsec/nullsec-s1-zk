pragma circom 2.1.0;

template AdminGate() {
  signal input isAdmin;
  signal input balance;
  signal output allowedAmount;

  allowedAmount <== isAdmin * balance;
}

component main = AdminGate();
