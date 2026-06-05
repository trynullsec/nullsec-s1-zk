pragma circom 2.1.0;

template Transfer() {
  signal input sender;
  signal input receiver;
  signal input amount;
  signal output commitment;

  component hasher = Poseidon(3);
  hasher.inputs[0] <== sender;
  hasher.inputs[1] <== receiver;
  hasher.inputs[2] <== amount;

  commitment <-- hasher.out;
}

component main = Transfer();
