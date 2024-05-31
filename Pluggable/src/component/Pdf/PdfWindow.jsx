import { useState, useEffect, useRef } from 'preact/hooks';
import { Document, Page } from 'react-pdf'; 
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styles from "./styles.module.css";

function PdfWindow({ pdfUrl }) {
  // State variables
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagesToRender, setPagesToRender] = useState([1, 2]); 
  const [pdfBlob, setPdfBlob] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch PDF when component mounts or pdfUrl changes
  useEffect(() => {
    fetchPdf(pdfUrl);
  }, [pdfUrl]);

  // Function to fetch PDF
  const fetchPdf = (url) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        setPdfBlob(blob);
      })
      .catch(error => console.error('Error fetching PDF:', error));
  };

  // Callback function when PDF is loaded successfully
  const handlePdfLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Function to handle page navigation
  const handlePageChange = (action) => {
    if (action === "next" && currentPage < numPages) {
      setCurrentPage(prevPage => prevPage + 2); 
      setPagesToRender(prevPages => [prevPages[0] + 2, prevPages[0] + 3]); 
    } else if (action === "previous" && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 2); 
      setPagesToRender(prevPages => [prevPages[0] - 2, prevPages[0] - 1]); 
    }
  };

  // Function to handle search form submission
  const handleSearch = (event) => {
    event.preventDefault();
    const searchPage = parseInt(searchInputRef.current.value);
    if (searchPage >= 1 && searchPage <= numPages) {
      setCurrentPage(searchPage);
      if (searchPage === 1) {
        setPagesToRender([1, 2]);
      } else {
        setPagesToRender([searchPage - 1, searchPage]);
      }
    }
    searchInputRef.current.value= "";
  };

  return (
    <div>
      {pdfBlob && (
        <Document file={pdfBlob}  onLoadSuccess={handlePdfLoadSuccess} className={`${styles.main} transition-all`}>
          {pagesToRender.map((page) => (
            <Page key={`page_${page}`}  pageNumber={page} />
          ))}
        </Document>
      )}

      <div className="flex items-center flex-col justify-center gap-3 mt-2">
        
        <p>
          Page {`${currentPage} - ${Math.min(currentPage + 1, numPages)} `} of {numPages}
        </p>

        
        <div className="flex gap-5">
          <button className="w-32 px-4 py-2 bg-zinc-100 text-black rounded-full flex items-center justify-between"  onClick={() => handlePageChange("previous")} disabled={currentPage === 1}>
            <span className={"text-sm font-medium"}>
              Previous
            </span>
          </button>
          <button className="w-32 px-4 py-2 bg-zinc-100 text-black rounded-full flex items-center justify-between" onClick={() => handlePageChange("next")} disabled={currentPage >= numPages}>
            <span className={"text-sm font-medium"}>
              Next
            </span>
          </button>
        </div>


        <form onSubmit={handleSearch} className="flex text-white gap-5" >
        <input type="number" class="bg-zinc-900 border  x border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2" required placeholder="Enter Page No"  style={{color:"white"}} ref={searchInputRef} min={1} max={numPages}  />
          <button className="w-32 flex-none px-4 py-1 bg-zinc-100 text-black rounded-full flex items-center justify-between">
            <span className={"text-sm font-medium"}>
              Search
            </span>
          </button>
        </form>
      </div>

      
    </div>
  );
}

export default PdfWindow;
