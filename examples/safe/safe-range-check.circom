pragma circom 2.1.0;

template SafeRangeCheck() {
  signal input amount;
  signal input balance;
  signal output remainingBalance;

  component amountBits = Num2Bits(64);
  component balanceBits = Num2Bits(64);
  amountBits.in <== amount;
  balanceBits.in <== balance;

  remainingBalance <== balance - amount;
}

component main = SafeRangeCheck();
