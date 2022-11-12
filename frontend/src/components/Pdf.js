import { useState } from 'react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
// import axios
import axios from 'axios';
const Pdf = () => {
  const [barkodNo, setBarkodNo] = useState("YOKOG18C83NE4FJAGW");
  const [tc, setTc] = useState("10089028918");
  const [pdfUrl, setPdfUrl] = useState("");
  const pageNumber = 1;
  const [selectedText, setSelectedText] = useState(null);


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
    const selectedText = window.getSelection().toString();
    setSelectedText(selectedText);
    // send request to http://localhost:3001/generate_proof?barkod=${barkodNo}&tc=${tc}
  }

  if(selectedText){
    return (
      <div>
        <h1>Selected Text: {selectedText}</h1>
        <h3>Barkod: {barkodNo}</h3>
        <h3>TC: {tc}</h3>
        <div className="w-32 h-32">
            <svg width="1024" height="1024" viewBox="0 0 1024 1024" className="w-80 h-80" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:"#FF0000",stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:"#FFFF00",stopOpacity:1}} />
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
  if(pdfUrl){
    // Show the pdf on the screen
    return (
      <div>
        <a href={pdfUrl}>SEE PDF</a>
        <Document file={pdfUrl}>
          <Page pageNumber={pageNumber} />
        </Document>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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