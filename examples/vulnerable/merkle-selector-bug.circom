pragma circom 2.1.0;

template MerkleSelector() {
  signal input left;
  signal input right;
  signal input pathIndex;
  signal output selected;

  selected <== pathIndex * left + (1 - pathIndex) * right;
}

component main = MerkleSelector();
