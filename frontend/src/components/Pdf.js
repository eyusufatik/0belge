import { ethers, BigNumber } from 'ethers';
import { useState, useCallback } from 'react'
// import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';

import { PdfViewer } from "react-pdf-selection";

const badgeABI = require('../abi/badge.json')

const badgeAddress = "0xdC78e8665A0925173056C664c1E4dE16148b01D7"

const Viewer = ({ document }) => {
  return (
      <div>
          <div style={{ display: "flex", flexDirection: "row" }}>
              <div style={{ width: "60%" }}>{document}</div>
          </div>
      </div>
  );
};

const Pdf = () => {
  const [barkodNo, setBarkodNo] = useState("YOKOG18C83NE4FJAGW");
  const [tc, setTc] = useState("10089028918");
  const [pdfUrl, setPdfUrl] = useState("");
  const pageNumber = 1;
  const [selectedText, setSelectedText] = useState(null);
  const [selection, setSelection] = useState();


  const getPdf = async () => {
    alert("PDF indiriliyor...");
    // const response = await axios.get(`http://localhost:5000/get_document?barkod=${barkodNo}&tc=${tc}`);
    // console.log(response);
    setPdfUrl(`http://127.0.0.1:5000/get_document?barkod=${barkodNo}&tc=${tc}`);
  }

  const mintNft = async () => {
    // get selected text in window
    // const iframe = document.getElementById('iframe');
    // const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    // const selectedText = iframeDocument.getSelection().toString();
    // alert(selectedText);
    // const text = window.getSelection().toString();
    const text = "Öğrenci";
    console.log("WOOOOOOOOOO", text);
    setSelectedText(text);
    // send request to http://localhost:3001/generate_proof?barkod=${barkodNo}&tc=${tc}
    const proof = "0x05433396a101e2652adbe0698d4f172bc25444451e0674c1d95821266390fbdd29428122fa2ca3b823383927e1a883890caa6c124878286bfa9627a163f7b599238dfbc62ca68812aa8ca60c4ebf0f24d59c68c190648fb1a9e3bfd22592c0582c3974477dee40a8153556c8a4d237e595f0fdb68776980bda5c1c352265dbd6267ec4612c29025bbb9d4c4d9a07adc798a68fea6cfbea78340364a3479cf6b50e1b93c64c240ce4cdbfd4c5e68faa513db78ba39e8f93e6d24bd6711c4b0d541b8f9f2b2813c7a3f392f2acd53a02447aefbed1e80f1b3772bec990d8e7abf315245ba110792a25477db4b15a0a342cca1703de85226372bc45956be4c66834";
    const docHash = "0x06a737e23f2991b63c73865215a2b2e27df54aafefb9d1ce205e664fc809f118";
    const num = "0x0000000000000000000000000000000000000000000000000000000000000077";

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log(badgeABI);

    const contract = new ethers.Contract(badgeAddress, badgeABI, signer);

    await contract.mint(proof, docHash, num);
  }

  const setAndLogSelection = useCallback(
    (highlightTip) => {
        // console.log(
        //     highlightTip ? `New ${"image" in highlightTip ? "area" : "text"} selection` : "Reset selection",
        //     highlightTip?.position,
        // );
        setSelection(highlightTip);
    },
    [setSelection],
);


  if (selectedText) {
    return (
      <div>
        {/* <h1>Selected Text: {selectedText}</h1> */}
        <h3>Barkod: {barkodNo}</h3>
        <h3>TC: {tc}</h3>
        <div className="w-fit h-fit">
          <svg width="1024" height="1024" viewBox="0 0 1024 1024" className="w-80 h-80" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "#FF0000", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#FFFF00", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="1024" height="1024" rx="50" ry="50" fill="url(#grad1)" />
            <text fill="#ffffff" fontSize="45" fontFamily="Verdana" x="100" y="924">{selectedText}</text>
            <text fill="#ffffff" fontSize="45" fontFamily="Verdana" x="100" y="100">0Belge</text>
          </svg>
        </div>
      </div>
    )
  }

  // Return a tailwind div with two text boxes and one submit button
  if (pdfUrl) {
    // Show the pdf on the screen
    return (
      <div>
        <a href={pdfUrl}>SEE PDF</a>
        <PdfViewer
          url={pdfUrl}
          // selections={pdfs[pdfIdx].selections}
          // enableAreaSelection={useCallback(() => areaSelectionActive, [areaSelectionActive])}
          // scale={scale}
          onTextSelection={setAndLogSelection}
          // onAreaSelection={setAndLogSelection}
          // onLoad={dims => console.log(dims)}
        >
          {({ document }) => <Viewer document={document} />}
        </PdfViewer>
        <button
          className="my-2 mx-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={mintNft}
        >Mint NFT</button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="flex flex-col items-center justify-center w-full max-w-md px-4 py-6 space-y-4 bg-white border border-gray-300 rounded-md shadow-md">
        <div className="flex flex-col space-y-2">
          <label htmlFor="barkodNo" className="text-sm font-medium text-gray-700">
            Barkod No
          </label>
          <input
            type="text"
            id="barkodNo"
            name="barkodNo"
            value={barkodNo}
            onChange={(e) => setBarkodNo(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="tc" className="text-sm font-medium text-gray-700">
            Tc
          </label>
          <input
            type="text"
            id="tc"
            name="tc"
            value={tc}
            onChange={(e) => setTc(e.target.value)}
            className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          onClick={getPdf}
          className="w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Pdf;