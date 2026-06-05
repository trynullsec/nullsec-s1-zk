pragma circom 2.1.0;

template Payment() {
  signal input amount;
  signal input balance;
  signal output remainingBalance;

  remainingBalance <== balance - amount;
}

component main = Payment();
