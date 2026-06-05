pragma circom 2.1.0;

template PublicBinding() {
  signal input root;
  signal input nullifierHash;
  signal input secret;
  signal output out;

  out <== secret * secret;
}

component main = PublicBinding();
