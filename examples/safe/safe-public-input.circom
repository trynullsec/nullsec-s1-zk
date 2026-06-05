pragma circom 2.1.0;

template SafePublicInput() {
  signal input root;
  signal input nullifierHash;
  signal input computedRoot;
  signal input computedNullifierHash;
  signal output ok;

  root === computedRoot;
  nullifierHash === computedNullifierHash;
  ok <== 1;
}

component main = SafePublicInput();
