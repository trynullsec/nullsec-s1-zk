pragma circom 2.1.0;

template SafeComponentOutput() {
  signal input secret;
  signal input amount;
  signal output commitment;

  component amountBits = Num2Bits(64);
  amountBits.in <== amount;

  component h = Poseidon(2);
  h.inputs[0] <== secret;
  h.inputs[1] <== amount;

  commitment <== h.out;
}

component main = SafeComponentOutput();
