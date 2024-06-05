import { useEffect, useRef } from "preact/hooks";

const useDrawingBoard = (
  drawingAreaRef,
  clearBoardButtonRef,
  width,
  height
) => {
  const isDrawingModeRef = useRef(false);
  const shapesRef = useRef([]);
  const isUndoModeRef = useRef(false);
  let ogFunc;

  useEffect(() => {
    let drawingArea = drawingAreaRef.current;
    let clearBoardButton = clearBoardButtonRef.current;
    let currentPath;
    let points = [];

    let isPathClosed = false;

    if (!isUndoModeRef.current) enableDrawingMode();
    clearBoardButton.addEventListener("click", clearBoard);
    document.addEventListener("keydown", handleUndoShortcut);

    function handleUndoShortcut(e) {
      if (e.ctrlKey && e.key === "z") {
        undo();
      }
    }

    function enableDrawingMode() {
      isDrawingModeRef.current = true;
      drawingArea.addEventListener("mousedown", startDrawing);
    }

    function startDrawing(e) {
      e.preventDefault();
      e.stopPropagation();
      drawingArea.removeEventListener("mousemove", ogFunc);
      ogFunc = () => {};
      isUndoModeRef.current = false;
      if (!isDrawingModeRef.current) {
        return;
      }

      const [x, y] = getMousePosition(e);

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
        });
      } else {
        shape = shapesRef.current.find(
          (shape) => shape.path.id === currentPath.id
        );
        shape.points = points;
      }
      drawingArea.appendChild(point);

      updatePath({
        cpath: currentPath,
        pointsArr: points,
      });
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
        point.setAttribute("r", "7");
      });
      point.addEventListener("mouseleave", () => {
        point.setAttribute("r", "5");
      });

      return point;
    };

    const isPointClicked = (point, e) => {
      const [x, y] = getMousePosition(e);
      const px = parseFloat(point.getAttribute("cx"));
      const py = parseFloat(point.getAttribute("cy"));
      const radius = parseFloat(point.getAttribute("r"));
      return Math.sqrt((x - px) ** 2 + (y - py) ** 2) < radius + 10;
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
    };

    const drag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDrawingModeRef.current = false;
      if (!selectedPoint) return;

      const borderWidth = 2;
      const [x, y] = getMousePosition(e);

      const boundingRect = drawingArea.getBoundingClientRect();
      const minX = boundingRect.left + borderWidth;
      const maxX = boundingRect.right - borderWidth;
      const minY = boundingRect.top + borderWidth;
      const maxY = boundingRect.bottom - borderWidth;

      const CTM = drawingArea.getScreenCTM();
      const svgMinX = (minX - CTM.e) / CTM.a;
      const svgMaxX = (maxX - CTM.e) / CTM.a;
      const svgMinY = (minY - CTM.f) / CTM.d;
      const svgMaxY = (maxY - CTM.f) / CTM.d;

      let newX = x - offset[0];
      let newY = y - offset[1];
      newX = Math.max(svgMinX, Math.min(newX, svgMaxX));
      newY = Math.max(svgMinY, Math.min(newY, svgMaxY));

      const strokeWidth =
        parseFloat(selectedPoint.getAttribute("stroke-width")) || 0;
      newX -= strokeWidth / 2;
      newY -= strokeWidth / 2;

      newX = Math.round(newX);
      newY = Math.round(newY);

      selectedPoint.setAttribute("cx", newX);
      selectedPoint.setAttribute("cy", newY);

      updatePath({
        cpath: selectedPointPath,
        pointsArr: selectedShape.points,
        closed: selectedShape.closed,
      });

      if (selectedShape.closed) {
        updateLabelPosition(selectedShape);
      }
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
    };

    const updatePath = ({
      cpath = undefined,
      pointsArr = [],
      mouseX = undefined,
      mouseY = undefined,
      closed = undefined,
    } = {}) => {
      let d = "M ";
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
        d += " Z";
        let reqShape = shapesRef.current.find((shape) => {
          return shape.path === cpath;
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
      updatePath({
        cpath: currentPath,
        pointsArr: currPathPoints,
        closed: selectedShape.closed,
      });
      currPathPoints.forEach((point) => {
        point.addEventListener("mousedown", startDrag);
      });

      addLabelToShape(selectedShape);

      currentPath = null;
      points = [];
      drawingArea.removeEventListener("mousemove", ogFunc);
      ogFunc = () => {};
    };

    const addLabelToShape = (shape) => {
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.setAttribute("id", `label-${shape.path.id}`);
      label.setAttribute("fill", "white");
      label.textContent = `${shape.path.id} label`;
      drawingArea.appendChild(label);
      shape.label = label;
      updateLabelPosition(shape);
    };

    const updateLabelPosition = (shape) => {
      if (!shape.closed || !shape.label) return;

      const points = shape.points.map((point) => ({
        x: parseFloat(point.getAttribute("cx")),
        y: parseFloat(point.getAttribute("cy")),
      }));

      const centerX =
        points.reduce((sum, point) => sum + point.x, 0) / points.length;
      const centerY =
        points.reduce((sum, point) => sum + point.y, 0) / points.length;

      shape.label.setAttribute("x", centerX);
      shape.label.setAttribute("y", centerY);
    };

    function clearBoard() {
      while (drawingArea.firstChild) {
        drawingArea.removeChild(drawingArea.firstChild);
      }
      currentPath = null;
      points = [];
      isPathClosed = false;
      shapesRef.current = [];
    }

    function followCursor(e, path, points) {
      if (!isUndoModeRef.current) return;

      if (points.length > 0) {
        const [x, y] = getMousePosition(e);
        updatePath({ cpath: path, pointsArr: points, mouseX: x, mouseY: y });
      }
    }

    function undo() {
      drawingArea.removeEventListener("mousemove", ogFunc);
      ogFunc = () => {};
      isUndoModeRef.current = true;
      if (shapesRef.current) {
        let shapes = shapesRef.current;
        if (shapes.length > 0) {
          let lastShape = shapes[shapes.length - 1];
          if (lastShape.points.length > 1) {
            let lastPoint = lastShape.points[lastShape.points.length - 1];
            if (lastPoint.parentNode) {
              lastPoint.parentNode.removeChild(lastPoint);
            }
            lastShape.points.pop();

            if (lastShape.closed) {
              lastShape.closed = false;
              isPathClosed = false;
              const pathData = lastShape.path.getAttribute("d");
              const updatedPathData = pathData.replace(/Z/g, "");
              lastShape.path.setAttribute("d", updatedPathData);
              currentPath = lastShape.path;
              points = lastShape.points;
              isDrawingModeRef.current = true;

              if (lastShape.label && lastShape.label.parentNode) {
                lastShape.label.parentNode.removeChild(lastShape.label);
                lastShape.label = null;
              }
            }
            updatePath({ cpath: lastShape.path, pointsArr: lastShape.points });
            ogFunc = (e) => followCursor(e, lastShape.path, lastShape.points);
            drawingArea.addEventListener("mousemove", ogFunc);
          } else {
            let lastPoint = lastShape.points[lastShape.points.length - 1];

            if (lastPoint.parentNode) {
              lastPoint.parentNode.removeChild(lastPoint);
            }
            lastShape.points.pop();
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
      document.removeEventListener("keydown", handleUndoShortcut);
      drawingArea.removeEventListener("mousemove", followCursor);
      drawingArea.removeEventListener("mousedown", startDrawing);
    };
  }, [drawingAreaRef, clearBoardButtonRef, width, height]);
};

export default useDrawingBoard;
