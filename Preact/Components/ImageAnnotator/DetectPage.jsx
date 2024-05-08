import { useRef, useEffect } from "preact/hooks";

const DetectPage = ({ imageUrl, rectangles }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const image = new Image();
    image.src = imageUrl;

    const isTypeTwo = rectangles.length > 0 && rectangles[0].hasOwnProperty('type');

    const updateCanvasSize = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      rectangles.forEach(rect => {
        const x = rect.xmin;
        const y = rect.ymin;
        const width = rect.xmax - rect.xmin;
        const height = rect.ymax - rect.ymin;

        context.beginPath();
        context.rect(x, y, width, height);

        if (isTypeTwo) {
          context.fillStyle = rect.color || "blue";

 
          const fontSize = Math.min(width, height) / 5; 
          context.font = `${fontSize}px Arial`;

          const padding = 5; 
          const textX = x + padding;
          const textY = y + padding + fontSize; 
          console.log(`Text position: x=${textX}, y=${textY}`);

          context.fillText(rect.type, textX, textY);
        }

        context.strokeStyle = rect.color;
        context.lineWidth = 2;
        context.stroke();
      });
    };

    image.onload = updateCanvasSize;

    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [imageUrl, rectangles]);

  return (
    <div>
      { imageUrl ? <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }}></canvas> : <p>Image not found</p>} 
    </div>
  );
};

export default DetectPage;
