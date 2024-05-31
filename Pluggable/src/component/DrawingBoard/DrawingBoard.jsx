import { useEffect, useRef, useState } from "preact/hooks";
import "./styles.css";

function DrawingBoard({ height, width }) {
  const drawingAreaRef = useRef(null);
  const penToolButtonRef = useRef(null);
  const clearBoardButtonRef = useRef(null);
  const undoButtonRef = useRef(null);
  const [viewBox, setViewBox] = useState(`0 0 ${width} ${height}`);
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    setViewBox(`0 0 ${width} ${height}`);
  }, [width, height]);

  useEffect(() => {
    let drawingArea = drawingAreaRef.current;
    let penToolButton = penToolButtonRef.current;
    let clearBoardButton = clearBoardButtonRef.current;
    let undoButton = undoButtonRef.current;
    let isDrawing = false;
    let currentPath;
    let points = [];
    let isPathClosed = false;
    let isDragging = false;

    penToolButton.addEventListener("click", enableDrawingMode);

    clearBoardButton.addEventListener("click", clearBoard);
    undoButton.addEventListener("click", undoLastPoint);

    function enableDrawingMode() {
      drawingArea.addEventListener("mousedown", startDrawing);
      drawingArea.addEventListener("mousemove", draw);
      drawingArea.addEventListener("mouseup", stopDrawing);
    }

    function startDrawing(e) {
      if (isPathClosed) return; // Prevent starting a new path if the current one is closed

      const [x, y] = getMousePosition(e);

      // Check if the first point is clicked again to close the path
      if (points.length > 1 && isPointClicked(points[0], e)) {
        closePath();
        return;
      }

      isDrawing = true;

      if (!currentPath) {
        currentPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        currentPath.setAttribute("d", `M ${x} ${y}`);
        currentPath.setAttribute("stroke", "white");
        currentPath.setAttribute("stroke-width", "2");
        currentPath.setAttribute("fill", "none");
        drawingArea.appendChild(currentPath);
      }

      const point = createPoint(x, y);
      drawingArea.appendChild(point);
      points.push(point);

      updatePath(); // Update the path immediately after creating a new point
    }

    function draw(e) {
      if (!isDrawing || isPathClosed) return;

      // If in undo mode and the user hasn't clicked a new point, show the line following the cursor
      if (points.length > 0) {
        const [x, y] = getMousePosition(e);
        updatePath(x, y);
      }
    }

    function stopDrawing() {
      isDrawing = false;
    }

    function getMousePosition(e) {
      const CTM = drawingArea.getScreenCTM();
      return [(e.clientX - CTM.e) / CTM.a, (e.clientY - CTM.f) / CTM.d];
    }

    function createPoint(x, y) {
      const point = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );

      point.setAttribute("cx", x);
      point.setAttribute("cy", y);
      point.setAttribute("r", "5");
      point.setAttribute("fill", "red");
      point.setAttribute("cursor", "pointer");
      point.classList.add("point");
      point.addEventListener("mousedown", startDrag);
      point.addEventListener("mouseenter", () => {
        point.setAttribute("r", "7"); // Enlarge the radius
      });
      point.addEventListener("mouseleave", () => {
        point.setAttribute("r", "5"); // Revert the radius to normal size
      });

      return point;
    }

    function isPointClicked(point, e) {
      const [x, y] = getMousePosition(e);
      const px = parseFloat(point.getAttribute("cx"));
      const py = parseFloat(point.getAttribute("cy"));
      const radius = parseFloat(point.getAttribute("r"));
      return Math.sqrt((x - px) ** 2 + (y - py) ** 2) < radius + 10; // Increase tolerance for easier clicking
    }

    let selectedPoint = null;
    let offset = [0, 0];

    function startDrag(e) {
      e.stopPropagation();
      selectedPoint = e.target;
      const [x, y] = getMousePosition(e);
      offset = [
        x - selectedPoint.getAttribute("cx"),
        y - selectedPoint.getAttribute("cy"),
      ];
      selectedPoint.setAttribute(
        "original-cx",
        selectedPoint.getAttribute("cx")
      );
      selectedPoint.setAttribute(
        "original-cy",
        selectedPoint.getAttribute("cy")
      );
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", endDrag);

      // Set flag to indicate dragging
      isDragging = true;
    }

    function drag(e) {
      if (!selectedPoint) return;
      if (!isDragging) return;

      const borderWidth = 2; // Adjust this if the border width changes
      const [x, y] = getMousePosition(e);

      // Calculate the boundaries of the drawing area relative to the viewport
      const boundingRect = drawingArea.getBoundingClientRect();
      const minX = boundingRect.left + borderWidth;
      const maxX = boundingRect.right - borderWidth;
      const minY = boundingRect.top + borderWidth;
      const maxY = boundingRect.bottom - borderWidth;

      // Convert the viewport coordinates to SVG coordinates
      const CTM = drawingArea.getScreenCTM();
      const svgMinX = (minX - CTM.e) / CTM.a;
      const svgMaxX = (maxX - CTM.e) / CTM.a;
      const svgMinY = (minY - CTM.f) / CTM.d;
      const svgMaxY = (maxY - CTM.f) / CTM.d;

      // Ensure the new position is within the boundaries
      let newX = x - offset[0];
      let newY = y - offset[1];
      newX = Math.max(svgMinX, Math.min(newX, svgMaxX));
      newY = Math.max(svgMinY, Math.min(newY, svgMaxY));

      // Adjust for stroke width if necessary
      const strokeWidth =
        parseFloat(selectedPoint.getAttribute("stroke-width")) || 0;
      newX -= strokeWidth / 2;
      newY -= strokeWidth / 2;

      // Round coordinates to avoid sub-pixel issues
      newX = Math.round(newX);
      newY = Math.round(newY);

      // Update the position of the selected point
      selectedPoint.setAttribute("cx", newX);
      selectedPoint.setAttribute("cy", newY);

      updatePath();
      const shapeCoordinates = points.map((point) => [
        parseFloat(point.getAttribute("cx")),
        parseFloat(point.getAttribute("cy")),
      ]);
      console.log("Updated coordinates of the shape:", shapeCoordinates);
    }

    function endDrag() {
      if (!selectedPoint) return;
      selectedPoint = null;
      isDragging = false; // Reset dragging flag
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", endDrag);
    }

    function updatePath(mouseX, mouseY) {
      let d = "M ";
      points.forEach((point, index) => {
        d += `${point.getAttribute("cx")} ${point.getAttribute("cy")}`;
        if (
          index < points.length - 1 ||
          (mouseX !== undefined && mouseY !== undefined)
        ) {
          d += " L ";
        }
      });
      if (mouseX !== undefined && mouseY !== undefined) {
        d += `${mouseX} ${mouseY}`;
      }
      if (isPathClosed) {
        d += " Z"; // Close the path
      }
      currentPath.setAttribute("d", d.trim());
    }

    function closePath() {
      isPathClosed = true;
      if (points.length > 2) {
        const shapeCoordinates = points.map((point) => [
          parseFloat(point.getAttribute("cx")),
          parseFloat(point.getAttribute("cy")),
        ]);
        console.log("Coordinates of the closed shape:", shapeCoordinates);
        shapes.push(shapeCoordinates); // Store the points as a closed shape
        setShapes([...shapes]); // Update the state with the new shape
      }
      updatePath();
    }

    function clearBoard() {
      while (drawingArea.firstChild) {
        drawingArea.removeChild(drawingArea.firstChild);
      }
      isDrawing = false;
      currentPath = null;
      points = [];
      isPathClosed = false;
    }

    function undoLastPoint() {
      if (points.length > 0) {
        const lastPoint = points.pop();
        drawingArea.removeChild(lastPoint);
      }
      updatePath();

      // Allow the last segment to follow the cursor
      isDrawing = true;
      drawingArea.addEventListener("mousemove", draw);
    }

    return () => {
      penToolButton.removeEventListener("click", enableDrawingMode);
      drawingArea.removeEventListener("mousedown", startDrawing);
      drawingArea.removeEventListener("mousemove", draw);
      drawingArea.removeEventListener("mouseup", stopDrawing);
      clearBoardButton.removeEventListener("click", clearBoard);
      undoButton.removeEventListener("click", undoLastPoint);
    };
  }, []);

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
          ref={penToolButtonRef}
        >
          Pen Tool
        </button>
        <button
          className="w-40 px-4 py-2 bg-zinc-100 text-black rounded-full"
          ref={clearBoardButtonRef}
        >
          Clear Board
        </button>
        <button
          className="w-40 px-4 py-2 bg-zinc-100 text-black rounded-full"
          ref={undoButtonRef}
        >
          Undo
        </button>
      </div>
    </div>
  );
}

export default DrawingBoard;
