include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
// template RecursivePedersen(N){
//   signal input in[N*7];
//   signal output out;
//   component pedersenIlk = Pedersen(248*7);
//   component pedersen[N - 1] = Pedersen(248*8)[N - 1];
//   component bits[N*7] = Num2Bits(248)[N*7];
//   component pedersenBits[N - 1] = Num2Bits(248)[N - 1];
//   for(var i = 0; i < N; i++){
//   }
//   for(var i = 0; i < N; i++){
//   }
// }
// template Pedersen64(N, M){
//   signal input in[N*M];
//   signal output out
//   component pedersen[M] = Pedersen(248*N)[M];
//   component ultimate = Pedersen(255*M);
//   component bits[M] = Num2Bits(255)[M];
//   component ilkBits[N*M] = Num2Bits(248)[N*M];
//   for(var i = 0; i < M; i++){
//     for(var k = 0; k < N; k++){
//       ilkBits[i*N + k].in <== in[i*N + k];
//       for(var j = 0; j < 248; j++){
//         pedersen[i].in[248*k + j] <== ilkBits[i*N + k].out[j];
//       }
//     }
//     bits[i].in <== pedersen[i].out[0]
//     for(var j = 0; j < 255; j++){
//       ultimate.in[i*255+j] <== bits[i].out[j];
//     }
//   }
//   out <== ultimate.out[0];
// }

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
  signal private input left;
  signal private input right;
  signal input belgeHash; // Belgenin hash degeri

  component belgeHasher = BelgePedersenHasher(N);
  component bits[3] = Num2Bits(248)[3];
  component pedersen = Pedersen(248*3);
  for(var i = 0; i < N; i++) {
    belgeHasher.in[i] <== chunks[i];
  }
  bits[0].in <== left;
  // belgeHash === belgeHasher.out;
  bits[1].in <== belgeHasher.out;
  bits[2].in <== right;
  for(var i = 0; i < 3; i++){
    for(var j = 0; j < 248; j++){
      pedersen.in[i*248+j] <== bits[i].out[j];
    }
  }
  belgeHash === pedersen.out[0];
}


// template Deneme(N, M){
//   signal private input chunks[N*M]; // Belgenin string datasi
//   signal input belgeHash; // Belgenin hash degeri

//   component belgeHasher = Pedersen64(N, M);
//   for(var i = 0; i < N*M; i++) {
//     belgeHasher.in[i] <== chunks[i];
//   }

//   belgeHash === belgeHasher.out;
// }


component main = Belge(3);