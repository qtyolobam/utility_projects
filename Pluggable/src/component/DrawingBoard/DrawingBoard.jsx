import { useEffect, useRef, useState } from "preact/hooks";
import "./styles.css";
import { functionsIn } from "lodash";

const DrawingBoard = ({ height, width }) => {
  const drawingAreaRef = useRef(null);
  const clearBoardButtonRef = useRef(null);
  const undoButtonRef = useRef(null);
  const [viewBox, setViewBox] = useState(`0 0 ${width} ${height}`);
  const isDrawingModeRef = useRef(false);
  const shapesRef = useRef([]); // Use a ref to persist shapes
  const isUndoModeRef = useRef(false);
  let ogFunc;
  useEffect(() => {
    setViewBox(`0 0 ${width} ${height}`);
  }, [width, height]);

  useEffect(() => {
    let drawingArea = drawingAreaRef.current;
    let clearBoardButton = clearBoardButtonRef.current;
    let undoButton = undoButtonRef.current;
    let currentPath;
    let points = [];

    let isPathClosed = false;

    if (!isUndoModeRef.current) enableDrawingMode();
    clearBoardButton.addEventListener("click", clearBoard);
    undoButton.addEventListener("click", undo);

    function enableDrawingMode() {
      console.log("enable drawing called");
      isDrawingModeRef.current = true; // Update the ref
      drawingArea.addEventListener("mousedown", startDrawing);
    }

    function startDrawing(e) {
      e.preventDefault();
      e.stopPropagation();
      drawingArea.removeEventListener("mousemove", ogFunc);
      isUndoModeRef.current = false;
      if (!isDrawingModeRef.current) {
        // Use the ref
        return;
      }

      const [x, y] = getMousePosition(e);

      // Check if the first point is clicked again to close the path
      if (points.length > 1 && isPointClicked(points[0], e)) {
        closePath();
        return;
      }

      const point = createPoint(x, y);
      points.push(point);
      let shape;
      if (!currentPath) {
        isPathClosed = false;
        currentPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        currentPath.setAttribute("d", `M ${x} ${y}`);
        currentPath.setAttribute("stroke", "white");
        currentPath.setAttribute("stroke-width", "2");
        currentPath.setAttribute("fill", "none");
        currentPath.id = shapesRef.current.length.toString();
        drawingArea.appendChild(currentPath);
        shapesRef.current.push({
          path: currentPath,
          points: [...points],
          closed: isPathClosed,
        }); // Update ref
      } else {
        shape = shapesRef.current.find(
          (shape) => shape.path.id === currentPath.id
        );
        shape.points = points;
      }
      console.log("start draw function");
      console.log(shapesRef.current);
      drawingArea.appendChild(point);

      updatePath({
        cpath: currentPath,
        pointsArr: points,
      }); // Update the path immediately after creating a new point
    }

    const getMousePosition = (e) => {
      const CTM = drawingArea.getScreenCTM();
      return [(e.clientX - CTM.e) / CTM.a, (e.clientY - CTM.f) / CTM.d];
    };

    const createPoint = (x, y) => {
      const point = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );

      point.setAttribute("cx", x);
      point.setAttribute("cy", y);
      point.setAttribute("r", "5");
      point.setAttribute("fill", "red");
      point.setAttribute("cursor", "pointer");
      point.classList.add(`point`);
      point.addEventListener("mouseenter", () => {
        point.setAttribute("r", "7"); // Enlarge the radius
      });
      point.addEventListener("mouseleave", () => {
        point.setAttribute("r", "5"); // Revert the radius to normal size
      });

      return point;
    };

    const isPointClicked = (point, e) => {
      const [x, y] = getMousePosition(e);
      const px = parseFloat(point.getAttribute("cx"));
      const py = parseFloat(point.getAttribute("cy"));
      const radius = parseFloat(point.getAttribute("r"));
      return Math.sqrt((x - px) ** 2 + (y - py) ** 2) < radius + 10; // Increase tolerance for easier clicking
    };

    let selectedPoint = null;
    let selectedPointPath = null;
    let selectedShape = null;
    let offset = [0, 0];

    const startDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDrawingModeRef.current = false;
      selectedPoint = e.target;
      selectedShape = shapesRef.current.find((shape) =>
        shape.points.includes(selectedPoint)
      );
      selectedPointPath = selectedShape.path;

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
      console.log("Start Drag");
    };

    const drag = (e) => {
      console.log("Drag");
      e.preventDefault();
      e.stopPropagation();
      isDrawingModeRef.current = false;
      if (!selectedPoint) return;

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

      console.log(shapesRef.current);
      updatePath({
        cpath: selectedPointPath,
        pointsArr: selectedShape.points,
        closed: selectedShape.closed,
      });
    };

    const endDrag = (e) => {
      if (!selectedPoint) return;
      selectedPoint = null;
      selectedPointPath = null;
      selectedShape = null;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", endDrag);
      isDrawingModeRef.current = true;
      e.preventDefault();
      e.stopPropagation();
      console.log("End Drag");
    };

    const updatePath = ({
      cpath = undefined,
      pointsArr = [],
      mouseX = undefined,
      mouseY = undefined,
      closed = undefined,
    } = {}) => {
      console.log("update called");
      let d = "M ";
      console.log(cpath.closed);
      pointsArr.forEach((point, index) => {
        d += `${point.getAttribute("cx")} ${point.getAttribute("cy")}`;
        if (
          index < pointsArr.length - 1 ||
          (mouseX !== undefined && mouseY !== undefined)
        ) {
          d += " L ";
        }
      });

      if (mouseX !== undefined && mouseY !== undefined) {
        d += `${mouseX} ${mouseY}`;
      }

      if (closed) {
        d += " Z"; // Close the path
        let reqShape = shapesRef.current.find((shape) => {
          return shape.path === cpath; // Add a return statement here
        });
        if (reqShape) {
          reqShape.closed = true;
        }
      }

      cpath.setAttribute("d", d.trim());
    };

    const closePath = () => {
      isPathClosed = true;
      const currPathPoints = points;
      let selectedShape = shapesRef.current.find(
        (shape) => shape.path === currentPath
      );
      selectedShape.closed = isPathClosed;
      console.log("close shape function");
      updatePath({
        cpath: currentPath,
        pointsArr: currPathPoints,
        closed: selectedShape.closed,
      });
      currPathPoints.forEach((point) => {
        point.addEventListener("mousedown", startDrag);
      });

      console.log(shapesRef.current);
      currentPath = null;
      points = [];
      drawingArea.removeEventListener("mousemove", ogFunc);
      ogFunc = () => {};
    };

    function clearBoard() {
      while (drawingArea.firstChild) {
        drawingArea.removeChild(drawingArea.firstChild);
      }
      currentPath = null;
      points = [];
      isPathClosed = false;
      shapesRef.current = []; // Clear shapes ref
    }

    function followCursor(e, path, points) {
      if (!isUndoModeRef.current) return;

      if (points.length > 0) {
        const [x, y] = getMousePosition(e);
        updatePath({ cpath: path, pointsArr: points, mouseX: x, mouseY: y });
      }
    }

    function undo() {
      isUndoModeRef.current = true;
      if (shapesRef.current) {
        let shapes = shapesRef.current;
        if (shapes.length > 0) {
          let lastShape = shapes[shapes.length - 1];
          console.log(lastShape.path.id);
          if (lastShape.points.length > 1) {
            let lastPoint = lastShape.points[lastShape.points.length - 1];
            // Check if the element exists in the DOM and remove it
            if (lastPoint.parentNode) {
              lastPoint.parentNode.removeChild(lastPoint);
            }
            lastShape.points.pop();

            if (lastShape.closed) {
              lastShape.closed = false;
              isPathClosed = false;
              // Assuming lastShape.path is an SVG path element
              const pathData = lastShape.path.getAttribute("d");

              // Remove the "Z" command from the path data
              const updatedPathData = pathData.replace(/Z/g, "");

              // Set the updated path data back to the element
              lastShape.path.setAttribute("d", updatedPathData);

              currentPath = lastShape.path;
              points = lastShape.points;
              isDrawingModeRef.current = true;
            }
            console.log(lastShape.path, lastShape.points);
            updatePath({ cpath: lastShape.path, pointsArr: lastShape.points });
            ogFunc = (e) => followCursor(e, lastShape.path, lastShape.points);
            drawingArea.addEventListener("mousemove", ogFunc);
          } else {
            // If there is only one point, remove it with the path
            let lastPoint = lastShape.points[lastShape.points.length - 1];

            if (lastPoint.parentNode) {
              lastPoint.parentNode.removeChild(lastPoint);
            }
            lastShape.points.pop();
            // If there are no points left in the shape, remove the path
            if (lastShape.path.parentNode) {
              lastShape.path.parentNode.removeChild(lastShape.path);
            }
            shapes.pop();
            currentPath = null;
            points = [];
            isUndoModeRef.current = false;
          }
        }
      }
    }

    return () => {
      clearBoardButton.removeEventListener("click", clearBoard);
      drawingArea.removeEventListener("mousemove", followCursor);
      drawingArea.removeEventListener("mousedown", startDrawing);
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
};

export default DrawingBoard;
