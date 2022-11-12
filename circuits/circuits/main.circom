pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";


template BelgePedersenHasher() {
  signal input in[256]; // Belgenin string datasi
  signal output out; // Belgenin hash degeri

  component pedersen = Pedersen(63488);
  for(var i = 0; i < 256; i++) {
    component bits = Num2Bits(248);
    bits.in <== in[i];
    pedersen.in[i*248 + 0] <== bits.out[0];
  }
  out <== pedersen.out;
}

template Belge(){
  signal input in[256]; // Belgenin string datasi
  signal input belgeHash; // Belgenin hash degeri

  component pedersen = BelgePedersenHasher();
  pedersen.in <== in;
  pedersen.out === belgeHash;
}

component main = Belge();