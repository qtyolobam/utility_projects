import Board from "../component/Board";
import DrawingBoard from "../component/DrawingBoard/DrawingBoard";

function Scribble() {
  return (
    <div className="flex items-center justify-center">
      <Board />
      {/* <DrawingBoard height="600" width="800" /> */}
    </div>
  );
}

export default Scribble;
