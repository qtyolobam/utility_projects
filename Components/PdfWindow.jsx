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
        <Document file={pdfBlob} onLoadSuccess={handlePdfLoadSuccess} className={styles.main}>
          {pagesToRender.map((page) => (
            <Page key={`page_${page}`} pageNumber={page} />
          ))}
        </Document>
      )}

      <p>
        Page {`${currentPage} - ${Math.min(currentPage + 1, numPages)} `} of {numPages}
      </p>

      <button onClick={() => handlePageChange("previous")} disabled={currentPage === 1}>
        Previous
      </button>
      <button onClick={() => handlePageChange("next")} disabled={currentPage >= numPages}>
        Next
      </button>

      <form onSubmit={handleSearch}>
        <input type="number" ref={searchInputRef} min={1} max={numPages} required />
        <button type="submit">
          Search
        </button>
      </form>
    </div>
  );
}

export default PdfWindow;
