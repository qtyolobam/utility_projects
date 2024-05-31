import { useState, useRef, useEffect } from "preact/hooks";

function PenTool() {
  const svgRef = useRef(null);

  useEffect(() => {
    let board = svgRef.current;

    const getMousePosition = (e) => {
      const CTM = board.getScreenCTM();
      return [(e.clientX - CTM.e) / CTM.a, (e.clientY - CTM.f) / CTM.d];
    };

    const handleSvgClick = (e) => {
      const [x, y] = getMousePosition(e);
      const point = createPoint(x, y);
    };

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

    if (board) {
      board.addEventListener("click", handleSvgClick);
    }
  }, []);

  return (
    <>
      <svg ref={svgRef}></svg>
    </>
  );
}

export default PenTool;
