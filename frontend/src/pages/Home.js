import Pdf from '../components/Pdf';

function Home() {
  return (
    <section className="w-full pt-32 relative flex flex-col justify-center items-center">
      <div className="container w-full flex items-center justify-center">
        <div className="w-full max-w-lg shadow-2xl border-2 border-gray-100 rounded-lg">
          <nav className="block w-full border-b-2 border-gray-100">
            <ul className="flex">
              <li className='text-gray-600 py-4 px-6 block '>
                  PDF
              </li>
            </ul>
          </nav>
          <div className="p-5">
            <Pdf />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;