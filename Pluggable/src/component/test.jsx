import { useState, useRef, useEffect } from "preact/hooks";

const PenToolSVG = () => {
  const svgRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [pointIdCounter, setPointIdCounter] = useState(0);
  const [draggedCircle, setDraggedCircle] = useState(null);

  useEffect(() => {
    if (draggedCircle) {
      const handleMouseMove = (e) => {
        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;

        const newShapes = shapes.map((shape, shapeIndex) => {
          const newPoints = shape.points.map((point, pointIndex) => {
            if (point.id === draggedCircle.id) {
              return { ...point, x: newX, y: newY };
            }
            return point;
          });
          return { ...shape, points: newPoints };
        });
        setShapes(newShapes);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        setDraggedCircle(null);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  }, [draggedCircle, shapes]);

  const handleSvgClick = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPoint = { x, y, id: `point_${pointIdCounter}` };

    if (points.length > 0) {
      const startPoint = points[0];
      const distance = Math.hypot(startPoint.x - x, startPoint.y - y);

      if (distance < 10) {
        setShapes([...shapes, { points: [...points, points[0]] }]);
        setPoints([]);
        setPointIdCounter(pointIdCounter + 1);
        return;
      }
    }

    setPoints([...points, newPoint]);
    setPointIdCounter(pointIdCounter + 1);
  };

  const generatePathD = (points) => {
    if (points.length === 0) return "";
    const [firstPoint, ...restPoints] = points;
    const pathD =
      `M ${firstPoint.x} ${firstPoint.y} ` +
      restPoints.map((point) => `L ${point.x} ${point.y}`).join(" ");
    return pathD;
  };

  const clearBoard = () => {
    setPoints([]);
    setShapes([]);
    setPointIdCounter(0);
  };

  return (
    <div className="flex items-center flex-col">
      <svg
        ref={svgRef}
        width="600"
        height="400"
        style={{ border: "1px solid black" }}
        onClick={handleSvgClick}
      >
        {shapes.map((shape, index) => (
          <g key={index}>
            <path d={generatePathD(shape.points)} fill="none" stroke="white" />
            {shape.points.map((point, i) => {
              if (i < shape.points.length - 1) {
                return (
                  <circle
                    key={point.id}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="red"
                    id={point.id}
                    onMouseDown={() => setDraggedCircle(point)}
                  />
                );
              }
            })}
          </g>
        ))}
        {points.map((point, index) => (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="red"
            id={point.id}
            onMouseDown={() => setDraggedCircle(point)}
          />
        ))}
        {points.length > 1 && (
          <path d={generatePathD(points)} fill="none" stroke="white" />
        )}
      </svg>

      <button
        onClick={clearBoard}
        style={{
          color: "black",
          padding: "5px 10px",
          backgroundColor: "white",
          border: "1px solid black",
          cursor: "pointer",
        }}
      >
        Clear Board
      </button>
    </div>
  );
};

export default PenToolSVG;
