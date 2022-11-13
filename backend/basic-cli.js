const fs = require('fs')
const assert = require('assert')
const { bigInt } = require('snarkjs')
const crypto = require('crypto')
const circomlib = require('circomlib')
const merkleTree = require('fixed-merkle-tree')
const Web3 = require('web3')
const buildGroth16 = require('websnark/src/groth16')
const websnarkUtils = require('websnark/src/utils')
const { toWei } = require('web3-utils')
const pdf = require('pdf-parse');

let circuit, proving_key, groth16

/** Generate random number of specified byte length */
const rbigint = (nbytes) => bigInt.leBuff2int(crypto.randomBytes(nbytes))

/** Compute pedersen hash */
const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]

/** BigNumber to hex string of specified length */
const toHex = (number, length = 32) =>
  '0x' +
  (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0')

const multipleHash = (a) => {
  const c = pedersenHash(Buffer.concat(a.map(x => x.leInt2Buff(31))))
  return c
}

const clearText = (str) => {
  // convert newlines to spaces
  str = str.replace(/(\r\n|\n|\r)/gm, " ");
  // lowercase
  str = str.toLowerCase()
  // change turkish characters to english
  str = str.replace(/ı/g, 'i')
  str = str.replace(/ğ/g, 'g')
  str = str.replace(/ü/g, 'u')
  str = str.replace(/ş/g, 's')
  str = str.replace(/ö/g, 'o')
  str = str.replace(/ç/g, 'c')
  // remove all non-alphanumeric characters
  str = str.replace(/[^a-z0-9 ]/g, '')
  // remove all multiple spaces
  str = str.replace(/\s+/g, ' ')
  // trim
  str = str.trim()
  return str
}

const string2chunks = (str, searching) => {
  str = clearText(str);
  searching = clearText(searching);
  console.log('str\n', str)
  console.log('searching\n', searching)

  let flag = 0, chunks;
  while(flag == 0){
    const bytes = Buffer.from(str, 'utf8');
    // split bytes into chunks of 31 bytes
    // generate an empty chunk array
    chunks = [];
  
    for(let i = 0; i < bytes.length; i += 31) {
      const chunk = bytes.slice(i, i + 31);
      // convert chunk to string
      const chunkStr = chunk.toString('utf8');
      // if chunk contains the searching string, add it to the chunks array
      if(chunkStr.includes(searching)) {
        flag = i/31 + 1;
      }
      // pad with zeros
      const padded = Buffer.concat([chunk, Buffer.alloc(31 - chunk.length)]);
      // convert padded chunk to bigInt
      // const bigIntChunk = bigInt.leBuff2int(padded);
      // add padded to array
      chunks.push(padded);
    }
    console.log('chunks\n', chunks.length)
    // add space
    str = ' ' + str;
    console.log("ADDING SPACE")
  }
  return {chunks, index:flag};
}

const extractTextFromPdf = async (filepath) => {
  let dataBuffer = fs.readFileSync(filepath);
  const data = await pdf(dataBuffer);
  let text = data.text;
  return text;
}

const generateProof = async (a, idx, characterCnt, shiftCnt) => {
  console.log('Loading circuit and proving key...')
  circuit = require(__dirname + '/../build/circuits/main.json')
  proving_key = fs.readFileSync(__dirname + '/../build/circuits/main_proving_key.bin').buffer
  groth16 = await buildGroth16()
  // let a = []
  const N = 7, M = 7;
  // for(let i = 0; i < N*M; i++) {
  //   a.push(rbigint(31))
  // }
  let b = []
  for(let i = 0; i < N; i++) {
    const x = multipleHash(a.slice(i*M, (i+1)*M))
    const x31 = x.and(bigInt(bigInt(2)).pow(bigInt(248)).sub(bigInt(1)));
    b.push(x31)
  }
  // const idx = 3;
  const indice = bigInt(idx)
  let value = a[idx]
  // const characterCnt = 8;
  // const shiftCnt = 100;
  const divident = bigInt(2).pow(bigInt(shiftCnt))
  const mask = bigInt(2).pow(bigInt(characterCnt)).sub(bigInt(1)).mul(bigInt(2).pow(bigInt(shiftCnt)))
  value = value.and(mask)
  value = value.div(divident)
  // const x = multipleHash(a.slice(0, 3))
  // const y = multipleHash(a.slice(3, 6))
  // // Get first 31 bytes of hash x = x AND 2^248 - 1
  // const x31 = x.and(bigInt(bigInt(2)).pow(bigInt(248)).sub(bigInt(1)))
  // // Get first 31 bytes of hash y = y AND 2^248 - 1
  // const y31 = y.and(bigInt(bigInt(2)).pow(bigInt(248)).sub(bigInt(1)))
  const hash = multipleHash(b)

  // const c =  rbigint(31)
  // const c = pedersenHash(Buffer.concat(a.map(x => x.leInt2Buff(31))))
  const input = { in:a, idx:indice, divident, mask, value, hash}
  console.log('Creating proof...')
  console.log('input', input)
  const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key)
  const publicSignals = proofData.publicSignals
  console.log('publicSignals', publicSignals)
  const args = publicSignals.map((p) => toHex(p))
  const { proof } = websnarkUtils.toSolidityInput(proofData)
  console.log('proof', proof)
  console.log(JSON.stringify(args))
}

async function main() {
  let a = []
  for(let i = 0; i < 7*7; i++) {
    a.push(rbigint(31))
  }
  const idx = 3, characterCnt = 8, shiftCnt = 100;
  await generateProof(a, idx, characterCnt, shiftCnt);
  return
  const tc = '10089028918';
  const barkod = "YOKOG18C83NE4FJAGW";
  const selectedText = "belge dogrulama veya yok mobil";
  // const {proof} = generateProof(selectedText);
  // console.log(proof);

  const text = await extractTextFromPdf("belgeler/" + tc + "_" + barkod + ".pdf");
  console.log(text);
  let {chunks, index} = string2chunks(text, selectedText);
  index -= 1;
  console.log(chunks);
  console.log(index - 1);
  const clearSelected = clearText(selectedText);
  const characterCntt = clearSelected.length;
  let curChunk = chunks[index];
  let shiftCntt = 0;
  while(shiftCntt < 31 && curChunk.toString('utf8').includes(clearSelected)){
    console.log(curChunk.toString('utf8'), clearSelected);
    // erase the least significant character
    curChunk = curChunk.slice(1, curChunk.length);
    shiftCntt += 1;

  }
  shiftCntt -= 1;
  console.log(curChunk);
  console.log(shiftCntt);

  return;

}

main()