import { render } from 'preact';
import './style.css';
import { LocationProvider, Router, Route } from 'preact-iso';
import Navbar from './component/Navbar';
import LocomotiveScroll from 'locomotive-scroll';
import HomePage from './Pages/HomePage';
import DetectPage from './Pages/DetectPage';
import { pdfjs } from 'react-pdf';
import PdfViewPage from './Pages/PdfViewPage';
import Scribble from './Pages/ScribblePage';


export function App() {
	const scroll = new LocomotiveScroll();

	pdfjs.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.min.js',
		import.meta.url,
	  ).toString();

	return (
		<div>
			<LocationProvider>
				<Navbar />
				<Router>
					<Route path="/" component={HomePage} />
					<Route path="/scribble" component={Scribble} />
					<Route path="/viewPDF" component={PdfViewPage} />
					<Route path="/detectResults" component={DetectPage} />
				</Router>
			</LocationProvider>
		</div>
		
		
	);
}


render(<App />, document.getElementById('app'));
