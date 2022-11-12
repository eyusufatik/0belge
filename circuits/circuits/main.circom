include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template Pedersen64(){
  signal input in[64];
  signal output out
  component pedersen[8] = Pedersen(248*8)[8];
  component ultimate = Pedersen(248*8);
  component bits[8] = Num2Bits(248)[8];
  for(var i = 0; i < 8; i++){
    for(var j = 0; j < 248*8; j++){
      pedersen[i].in[i*248+j] <== in[i*248+j];
    }

    bits[i].in <== pedersen[i].out[0]
    for(var j = 0; j < 248; j++){
      ultimate.in[i*248+j] <== bits[i].out[j];
    }
  }
  out <== ultimate.out[0];
}

template BelgePedersenHasher(N) {
  signal input in[N]; // Belgenin string datasi
  signal output out; // Belgenin hash degeri

  component pedersenHasherr = Pedersen(248*N);
  component bits[N] = Num2Bits(248)[N];

  for(var i = 0; i < N; i++) {
    bits[i].in <== in[i];
    for(var j = 0; j < 248; j++){
      pedersenHasherr.in[i*248+j] <== bits[i].out[j];
    }
  }
  out <== pedersenHasherr.out[0];
}

template Belge(N){
  signal private input chunks[N]; // Belgenin string datasi
  signal input belgeHash; // Belgenin hash degeri

  component belgeHasher = BelgePedersenHasher(N);
  for(var i = 0; i < N; i++) {
    belgeHasher.in[i] <== chunks[i];
  }

  belgeHash === belgeHasher.out;
}


template Deneme(){
  signal private input chunks[64]; // Belgenin string datasi
  signal input belgeHash; // Belgenin hash degeri

  component belgeHasher = Pedersen64();
  for(var i = 0; i < N; i++) {
    belgeHasher.in[i] <== chunks[i];
  }

  belgeHash === belgeHasher.out;
}


component main = Belge(8);