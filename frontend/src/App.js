import logo from './logo.svg';
import './App.css';
import React from 'react';

// import bigint from snarkjs
const snarkjs = require("snarkjs");
const circomlib = require("circomlib");
/** Compute pedersen hash */
// const pedersenHash = (data) => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]

// import react


function App() {
  const [belge, setBelge] = React.useState("");
  // on load set belge to BelgePedersenHash()
  React.useEffect(() => {
    console.log("useEffect");
    setBelge(BelgePedersenHash());
  }, []);

  const BelgePedersenHash = () => {
    console.log("BelgePedersenHash");
    const chunks = ["56858397600260208077046852247182485090268909834812573989411051127544958809" ,"115366970631544852139976717035608131148220155424266889123554456129375093593"];
    console.log(chunks)
    console.log("Buffer=>", Buffer.from(chunks[0]));
    return circomlib.pedersenHash.hash((Buffer.from(chunks[0])));
    return pedersenHash(Buffer.concat(chunks.map((c) => snarkjs.bigInt(c).leInt2Buff(31))));
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          BelgePedersenHashhhh = {belge}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
