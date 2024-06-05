import { useEffect, useRef, useState } from "preact/hooks";
import "./styles.css";
import useDrawingBoard from "./useDrawingBoard";

const DrawingBoard = ({ height, width }) => {
  const drawingAreaRef = useRef(null);
  const clearBoardButtonRef = useRef(null);
  const [viewBox, setViewBox] = useState(`0 0 ${width} ${height}`);

  useEffect(() => {
    setViewBox(`0 0 ${width} ${height}`);
  }, [width, height]);

  useDrawingBoard(drawingAreaRef, clearBoardButtonRef, width, height);

  return (
    <div className="absolute mt-[5vh] z-10 flex flex-col items-center gap-3">
      <svg
        ref={drawingAreaRef}
        viewBox={viewBox}
        className="border-2 border-white sm:w-4/5 sm:h-4/5 md:w-4/5 md:h-4/5 lg:w-4/5 lg:h-4/5 xl:w-4/5 xl:h-4/5"
        width={width}
        height={height}
      ></svg>
      <div className="menu flex gap-2">
        <button
          className="w-40 px-4 py-2 bg-zinc-100 text-black rounded-full"
          ref={clearBoardButtonRef}
        >
          Clear Board
        </button>
      </div>
    </div>
  );
};

export default DrawingBoard;
