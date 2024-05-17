import DetectView from "../component/DetectView";
import { detectDataType1, detectDataType2 } from "../Data/DetectPageResource";

function DetectPage() {
  const { imageUrl } = detectDataType2;
  const { rectangleCoordinates } = detectDataType2;

  return (
    <div className="flex items-center justify-center">
      <DetectView imageUrl={imageUrl} rectangles={rectangleCoordinates} />
    </div>
  );
}

export default DetectPage;
