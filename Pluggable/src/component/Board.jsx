import { useRef, useEffect, useState } from "preact/hooks";

const Board = () => {
  const canvasRef = useRef(null);
  const image1 = new Image();
  const [canvasStyle, setCanvasStyle] = useState(
    "sm:w-4/5 sm:h-4/5 md:w-4/5 md:h-4/5 lg:w-4/5 lg:h-4/5 xl:w-4/5 xl:h-4/5"
  );
  const clickedPoints = [];
  let paths = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    // image1.src = "https://imgtr.ee/images/2024/05/10/15197521accb22e9879b894fb7cb12a2.png"; // Full HD Image
    // image1.src = "https://iili.io/JPcjPEl.jpg";                               // Small Image
    image1.src = "https://svgshare.com/i/16Bm.svg"; // Full HD SVG

    image1.onload = () => {
      if (image1.width < canvas.width || image1.height < canvas.height) {
        setCanvasStyle(`w-[${image1.width}px] h-[${image1.height}px]`);
        canvas.width = image1.width;
        canvas.height = image1.height;
        context.drawImage(image1, 0, 0, image1.width, image1.height);
      } else {
        canvas.width = image1.width;
        canvas.height = image1.height;
        context.drawImage(image1, 0, 0, canvas.width, canvas.height);
      }
    };

    canvas.addEventListener("click", (event) => {
      const x =
        (event.clientX - canvas.getBoundingClientRect().left) *
        (canvas.width / canvas.clientWidth);
      const y =
        (event.clientY - canvas.getBoundingClientRect().top) *
        (canvas.height / canvas.clientHeight);

      if (clickedPoints.length > 2) {
        const startX = clickedPoints[0].x;
        const startY = clickedPoints[0].y;
        const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
        if (distance < 15) {
          context.beginPath();
          context.moveTo(clickedPoints[0].x, clickedPoints[0].y);
          for (let i = 1; i < clickedPoints.length; i++) {
            context.lineTo(clickedPoints[i].x, clickedPoints[i].y);
          }
          context.closePath();
          context.fillStyle = "rgba(255, 0, 0, 1  )";
          context.fill();
          paths = [[...clickedPoints]];
          clickedPoints.length = 0;
          console.log(paths);
          return;
        }
      }

      clickedPoints.push({ x, y });

      context.beginPath();
      context.arc(x, y, 3, 0, 2 * Math.PI, false);
      context.fillStyle = "red";
      context.fill();
      console.log(`Clicked at ${x} ${y}`);
    });
  }, [canvasStyle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  return <canvas className={canvasStyle} ref={canvasRef}></canvas>;
};

export default Board;
