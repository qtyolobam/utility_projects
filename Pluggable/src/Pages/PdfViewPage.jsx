import PdfWindow from "../component/Pdf/PdfWindow";

function PdfViewPage() {
  return (
    <div className="flex items-center justify-center">
      <PdfWindow pdfUrl="http://localhost:80/fetch-pdf" />
    </div>
  );
}

export default PdfViewPage;
