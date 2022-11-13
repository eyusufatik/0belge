include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
 
template Hasher() {
    signal input a;
    signal input b;
    signal output hash;

    component hasher = Pedersen(496);
    component aBits = Num2Bits(248);
    component bBits = Num2Bits(248);
    aBits.in <== a;
    bBits.in <== b;
    for (var i = 0; i < 248; i++) {
        hasher.in[i] <== aBits.out[i];
        hasher.in[i + 248] <== bBits.out[i];
    }
    hash <== hasher.out[0];
}
template MultipleHasher(N){
  signal input in[N];
  signal output hash;
  component hasher = Pedersen(248*N);
  component bits[N] = Num2Bits(248)[N];
  for(var i=0; i<N; i++){
    bits[i].in <== in[i];
    for(var j=0; j<248; j++){
      hasher.in[i*248+j] <== bits[i].out[j];
    }
  }
  hash <== hasher.out[0];
}

template EkremTree(N, M){
  signal private input in[N*M];
  signal output hash;
  component leafHasher[N] = MultipleHasher(M)[N];
  component rootHasher = Pedersen(248*N);
  component bits[N] = Num2Bits(255)[N];
  for(var i=0; i<N; i++){
    for(var j = 0; j < M; j++){
      leafHasher[i].in[j] <== in[i*M+j];
    }
    bits[i].in <== leafHasher[i].hash;
    for(var j=0; j<248; j++){
      rootHasher.in[i*248+j] <== bits[i].out[j];
    }
  }
  hash <== rootHasher.out[0];
}

template EscalarProduct(w) {
    signal input in1[w];
    signal input in2[w];
    signal output out;
    signal aux[w];
    var lc = 0;
    for (var i=0; i<w; i++) {
        aux[i] <== in1[i]*in2[i];
        lc = lc + aux[i];
    }
    out <== lc;
}

template Decoder(w) {
    signal input inp;
    signal output out[w];
    signal output success;
    var lc=0;

    for (var i=0; i<w; i++) {
        out[i] <-- (inp == i) ? 1 : 0;
        out[i] * (inp-i) === 0;
        lc = lc + out[i];
    }

    lc ==> success;
    success * (success -1) === 0;
}


template Multiplexer(nIn) {
    signal input inp[nIn];
    signal input sel;
    signal output out;
    component dec = Decoder(nIn);
    component ep = EscalarProduct(nIn);

    sel ==> dec.inp;
    for (var k=0; k<nIn; k++) {
        inp[k] ==> ep.in1[k];
        dec.out[k] ==> ep.in2[k];
    }
    ep.out ==> out;
    dec.success === 1;
}

template And(){
  signal input a;
  signal input b;
  signal output out;
  component abits = Num2Bits(248);
  component bbits = Num2Bits(248);
  component outbits = Bits2Num(248);
  abits.in <== a;
  bbits.in <== b;
  for(var i=0; i<248; i++){
    outbits.in[i] <== abits.out[i]*bbits.out[i];
  }
  out <== outbits.out;
}
template Ops2() {
    signal input in[2];
    signal output div;

    div  <-- in[0] / in[1];
}

template EkremProof(N, M){
  signal private input in[N*M];
  signal private input idx;
  signal private input mask;
  signal private input divident;
  signal output value;
  signal output hash;
  component tree = EkremTree(N, M);
  component mux = Multiplexer(N * M);
  component and = And();
  for(var i = 0; i < N*M; i++){
    tree.in[i] <== in[i];
    mux.inp[i] <== in[i];
  }
  mux.sel <== idx;
  and.a <== mux.out;
  and.b <== mask;

  // value <== and.out;
  component div = Ops2();
  div.in[0] <== and.out;
  div.in[1] <== divident;
  value <== div.div;

  hash <== tree.hash;
}
// component main = MultipleHasher(7);
component main = EkremProof(7, 7);
