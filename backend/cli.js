#!/usr/bin/env node
// Works both in browser and node.js

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const assert = require('assert');
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const circomlib = require('circomlib');
const bigInt = snarkjs.bigInt;
const merkleTree = require('fixed-merkle-tree');
const Web3 = require('web3');
// const Web3HttpProvider = require('web3-providers-http');
const buildGroth16 = require('websnark/src/groth16');
const websnarkUtils = require('websnark/src/utils');
const { toWei, fromWei, toBN, BN } = require('web3-utils');
const BigNumber = require('bignumber.js');
// const config = require('./config');
const program = require('commander');
const { GasPriceOracle } = require('gas-price-oracle');
const SocksProxyAgent = require('socks-proxy-agent');
const is_ip_private = require('private-ip');

const N = 8;

/** Whether we are in a browser or node.js */
const inBrowser = typeof window !== 'undefined';
let isTestRPC = false;

/** Generate random number of specified byte length */
const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes));

/** Compute pedersen hash */
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0];

const string2chunks = (str) => {
  const bytes = Buffer.from(str, 'utf8');
  // split bytes into chunks of 31 bytes
  // generate an empty chunk array
  const chunks = [];
  for(let i = 0; i < bytes.length; i += 31) {
    const chunk = bytes.slice(i, i + 31);
    // pad with zeros
    const padded = Buffer.concat([chunk, Buffer.alloc(31 - chunk.length)]);
    // convert padded chunk to bigInt
    // const bigIntChunk = bigInt.leBuff2int(padded);
    // add padded to array
    chunks.push(padded);
  }
  return chunks;
}
// const string2PedersenHash = (str) => {

//   console.log("chunks=>", chunks);
//   // const chunks = bytes.match(/.{1,31}/g);
//   // const chunks = str.match(/.{1,31}/g).map((c) => bigInt.leInt2Buff(c.length, 31));
//   return pedersenHash(Buffer.concat(chunks));
// }

const generateProof = async (str) => {
  const chunks = string2chunks(str);
  // if chunks size is less than N then pad with zeros
  const paddedChunks = chunks.length < N ? [...chunks, ...Array(N - chunks.length).fill(Buffer.alloc(31))] : chunks;
  console.log(paddedChunks);
  const chunksInput = paddedChunks.map((c) => BigInt(bigInt.leBuff2int(c)));
  const hash = pedersenHash(Buffer.concat(paddedChunks));
  // array of 256 integers
  const input = {
    // public input
    belgeHash:bigInt(hash),

    // private input 
    chunks: chunksInput,
  }
  console.log("hash=>", input.belgeHash);
  console.log("chunks=>", input.chunks);

  let groth16 = await buildGroth16();
  let circuit = require('../circuits/build/circuits/main.json');
  let proving_key = fs.readFileSync('../circuits/build/circuits/main_proving_key.bin').buffer;

  console.log('Generating SNARK proof');
  console.time('Proof time');
  const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key);
  const { proof } = websnarkUtils.toSolidityInput(proofData);
  return { proof };
}

const main = async () => {
  const proof = await generateProof("Hello Worladsfs ");
  console.log("proof=>", proof);
}
main();