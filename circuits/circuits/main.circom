include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";


template BelgePedersenHasher(N) {
  signal input in[N]; // Belgenin string datasi
  signal output out; // Belgenin hash degeri

  component pedersenHasher = Pedersen(248*N);
  component bits = Num2Bits(248);
  for(var i = 0; i < N; i++) {
    bits.in <== in[i];
    pedersenHasher.in[i*248 + 0] <== bits.out[0];
  }
  out <== pedersenHasher.out[0];
}

template Belge(N){
  signal private input chunks[N]; // Belgenin string datasi
  signal input belgeHash; // Belgenin hash degeri

  component pedersenHasher = BelgePedersenHasher(N);
  for(var i = 0; i < N; i++) {
    pedersenHasher.in[i] <== chunks[i];
  }

  pedersenHasher.out === belgeHash;
}

component main = Belge(256);