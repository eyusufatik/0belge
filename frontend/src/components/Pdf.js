import { useState } from 'react'
// import axios
import axios from 'axios';
const Pdf = () => {
  const [barkodNo, setBarkodNo] = useState("");
  const [tc, setTc] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const getPdf = async () => {
    alert("PDF indiriliyor...");
    const response = await axios.get(`http://localhost:3001/pdf/${barkodNo}/${tc}`);
    console.log(response);
    setPdfUrl(response.data);
  }

  // Return a tailwind div with two text boxes and one submit button
  if(pdfUrl){
    // Show the pdf on the screen
    return (
      <div>
        {barkodNo}
        {tc}
        <iframe src={pdfUrl} width="100%" height="1000px"></iframe>
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