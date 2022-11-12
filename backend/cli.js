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
const pdf = require('pdf-parse');



// const axios = require('axios').default;
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

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

const generateProof = async (str) => {
  const N = 3;
  const chunks = string2chunks(str);
  // if chunks size is less than N then pad with zeros
  const paddedChunks = chunks.length < N ? [...chunks, ...Array(N - chunks.length).fill(Buffer.alloc(31))] : chunks;
  console.log(paddedChunks);
  const chunksInput = paddedChunks.map((c) => BigInt(bigInt.leBuff2int(c)));
  // convert bigint to buffer
  // const chunks8Buffer = chunks8.map((c) => bigInt.leInt2Buff(c, 32));
  const hash0 = rbigint(31);
  const hash1 = pedersenHash(Buffer.concat(paddedChunks));
  // divide hash1 by 2^8
  // const hash11 = hash1.shrn(8);
  // get first 31 bytes of hash1
  const hash1_31 = hash1.and(bigInt(bigInt(2)).pow(bigInt(248)).sub(bigInt(1)));
  // get last 31 bytes of hash1
  const mid = rbigint(31);
  const hash2 = rbigint(31);
  console.log("hash0=>", hash0);
  console.log("hash1=>", hash1_31);
  console.log("hash2=>", hash2);

  const hash0Buffer = hash0.leInt2Buff(31);
  // get first 31 bits of hash0
  const hash1Buffer = hash1_31.leInt2Buff(31);
  const hash2Buffer = hash2.leInt2Buff(31);
  // concatanate all the hashes
  const hashes = Buffer.concat([hash0Buffer, hash1Buffer, hash2Buffer]);
  const hash = pedersenHash(hashes);

  // array of 256 integers
  const input = {
    // public input
    belgeHash:bigInt(hash),

    // private input 
    chunks: chunksInput,
    left: bigInt(hash0),
    right: bigInt(hash2),
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

const extractTextFromPdf = async (filepath) => {
  let dataBuffer = fs.readFileSync(filepath);
  const data = await pdf(dataBuffer);
  let text = data.text;
  // remove new lines
  text = text.replace(/(\r\n|\n|\r)/gm, "");
  // remove multiple spaces
  text = text.replace(/\s+/g, ' ');
  return text;
}

// Reference python code:
// import requests
// import json

// ENDPOINT = 'https://www.turkiye.gov.tr'


// def get_token(session):
//     """Get token from turkiye.gov.tr"""
    
//     response = session.get(ENDPOINT + '/belge-dogrulama')
//     # serach for data-token attribute
//     token = response.text.split('data-token="')[1].split('"')[0]
//     return token

// def get_document(tc, barkod):
//   # Create a session
//   session = requests.Session()
//   session.headers.update({
//         'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
//       })
//   session.base_uri = ENDPOINT
//   session.timeout = 5
//   response = session.get(ENDPOINT + '/belge-dogrulama')
//   token = response.text.split('data-token="')[1].split('"')[0]
//   print(token)
//   # return token
//   data = {
//     'sorgulananBarkod': barkod,
//     'token': token,
//     'btn': 'Devam+Et'
//   }
//   response = session.post(ENDPOINT + '/belge-dogrulama&submit', data=data)
//   token = response.text.split('data-token="')[1].split('"')[0]
//   print(token)
//   data = {
//     'ikinciAlan': tc,
//     'token': token,
//     'btn': 'Devam+Et'
//   }
//   response = session.post(ENDPOINT + '/belge-dogrulama?islem=dogrulama&submit=', data=data)
//   token = response.text.split('data-token="')[1].split('"')[0]
//   print(token)
//   data = {
//     'chkOnay': '1',
//     'token': token,
//     'btn': 'Devam+Et'
//   }
//   response = session.post(ENDPOINT + '/belge-dogrulama?islem=onay&submit', data=data)
//   token = response.text.split('data-token="')[1].split('"')[0]
//   print(token)
//   response = session.get(ENDPOINT + '/belge-dogrulama?belge=goster&goster=1&display=display')
//   # Convert response data to pdf and save it
//   with open('belge.pdf', 'wb') as f:
//     f.write(response.content)

//   # convert bytes to integer array
//   data = [int(x) for x in response.content]
//   return len(data)
//   return response.text


// def get_hex_from_bytes(data):
//     """Convert bytes to hex"""
//     return ''.join('{:02x}'.format(x) for x in data)

// def read_pdf(filename):
//     """Read pdf file and return bytes"""
//     with open(filename, 'rb') as f:
//         return get_hex_from_bytes(f.read())

// if __name__ == '__main__':
//   print(len(read_pdf('belge.pdf')))
//   # token = get_document('10089028918', 'YOKOG18C83NE4FJAGW')
//   # print(token)

const getBelgeFromEdevlet = async (tcNo, belgeNo) => {
  const ENDPOINT = 'https://www.turkiye.gov.tr';
  // const jar = new CookieJar();

  // const session = axios.create({
  //   withCredentials: true,
  //   baseURL: ENDPOINT,
  //   timeout: 5000,
  //   headers: {
  //     'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
  //   },
  // });
  let jar = new CookieJar();
  let session = wrapper(axios.create({
    jar,
    // withCredentials: true,
    baseURL: ENDPOINT,
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    },
  }));

  

  const get_token = async () => {
    const response = await session.get('/belge-dogrulama');
    const token = response.data.split('data-token="')[1].split('"')[0];
    return token;
  }

  const get_document = async (tc, barkod) => {
    let token = await get_token();
    console.log("First token=>", token);
    let data = {
      sorgulananBarkod: barkod,
      token: token,
      btn: 'Devam+Et'
    }
    let response = await session.post('/belge-dogrulama&submit', data);
    token = response.data.split('data-token="')[1].split('"')[0];
    console.log("Second token=>", token);
    data = {
      ikinciAlan: tc,
      token: token,
      btn: 'Devam+Et'
    }
    response = await session.post('/belge-dogrulama?islem=dogrulama&submit=', data);
    token = response.data.split('data-token="')[1].split('"')[0];
    console.log("Third token=>", token);
    data = {
      chkOnay: '1',
      token: token,
      btn: 'Devam+Et'
    }
    response = await session.post('/belge-dogrulama?islem=onay&submit', data);
    token = response.data.split('data-token="')[1].split('"')[0];
    console.log("Fourth token=>", token);
    response = await session.get('/belge-dogrulama?belge=goster&goster=1&display=display');
    // data = [int(x) for x in response.content];
    return "tet";
  }
  return await get_document(tcNo, belgeNo);

  // const get_hex_from_bytes = (data) => {
  //   return ''.join('{:02x}'.format(x) for x in data);
  // }

  // const read_pdf = (filename) => {
  //   with open(filename, 'rb') as f:
  //       return get_hex_from_bytes(f.read());
  // }

  // const token = await get_document('10089028918', 'YOKOG18C83NE4FJAGW');
  // console.log(token);

}

const main = async () => {
  console.log(await getBelgeFromEdevlet('10089028918', 'YOKOG18C83NE4FJAGW'));
  // const text = await extractTextFromPdf('belgeler/10089028918_Ogrenci.pdf');
  // console.log(text);
  // const proof = await generateProof("Hello Worladsfs ");
  // console.log("proof=>", proof);
}
main();
// pdfUtil.pdfToText('belgeler/10089028918_Ogrenci.pdf', function(err, data) {
//   if (err) throw(err);
//   console.log(data); //print all text    
// });