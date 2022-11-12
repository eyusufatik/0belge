const Pdf = () => {
  const [barkodNo, setBarkodNo] = useState("");
  const [tc, setTc] = useState("");

  // Return a tailwind div with two text boxes and one submit button
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
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
          className="w-full px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </div>
    </div>
  );
}