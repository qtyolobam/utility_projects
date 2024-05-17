import { useRef, useEffect, useState } from "preact/hooks";

const DetectPage = ({ imageUrl, rectangles }) => {
  // Ref to the canvas element
  const canvasRef = useRef(null);
  const [canvasStyle, setCanvasStyle] = useState(
    "sm:w-4/5 sm:h-4/5 md:w-4/5 md:h-4/5 lg:w-4/5 lg:h-4/5 xl:w-4/5 xl:h-4/5"
  );
  const image1 = new Image();

  // Array to store used colors
  let usedColors = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Failed to get canvas context");
      return;
    }

    image1.src = imageUrl;

    image1.onload = () => {
      // Adjust canvas size and draw the image
      if (image1.width < canvas.width || image1.height < canvas.height) {
        setCanvasStyle(`w-[${image1.width}px] h-[${image1.height}px]`);
      }
      canvas.width = image1.width;
      canvas.height = image1.height;
      context.drawImage(image1, 0, 0, image1.width, image1.height);

      // Draw rectangles after the image is loaded
      drawRectangles(context, rectangles);
    };

    image1.onerror = () => {
      console.error("Image failed to load");
    };

    // Function to generate a random color
    function getRandomColor(usedColors) {
      let color;
      do {
        color = [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
        ];
      } while (usedColors.some((c) => c.join() === color.join()));
      return color;
    }

    // Function to draw rectangles
    function drawRectangles(context, rectangles) {
      const isTypeTwo =
        rectangles.length > 0 && rectangles[0].hasOwnProperty("type");

      if (
        !rectangles ||
        !Array.isArray(rectangles) ||
        rectangles.length === 0
      ) {
        console.error("Rectangles array is not defined or empty");
        return;
      }

      rectangles.forEach((rect, index) => {
        console.log(`Processing rectangle ${index + 1}`);

        if (!rect || Object.keys(rect).length === 0) {
          console.warn(`Rectangle ${index + 1} is invalid or empty`);
          return;
        }

        const { xmin, ymin, xmax, ymax, type } = rect;

        if (xmin == null || ymin == null || xmax == null || ymax == null) {
          console.warn(`Rectangle ${index + 1} has invalid coordinates`);
          return;
        }

        const x = xmin;
        const y = ymin;
        const width = xmax - xmin;
        const height = ymax - ymin;

        if (width <= 0 || height <= 0) {
          console.warn(`Rectangle ${index + 1} has non-positive dimensions`);
          return;
        }

        context.beginPath();
        context.rect(x, y, width, height);

        const color = getRandomColor(usedColors);
        if (!Array.isArray(color) || color.length !== 3) {
          console.error("getRandomColor did not return a valid RGB array");
          return;
        }

        usedColors.push(color);

        if (isTypeTwo) {
          context.fillStyle = `rgb(${color.join(", ")})`;
          const fontSize = Math.min(width, height) / 5;
          context.font = `${fontSize}px Arial`;

          const padding = 5;
          const textX = x + padding;
          const textY = y + padding + fontSize;

          context.fillText(type, textX, textY);
        }

        context.strokeStyle = `rgb(${color.join(", ")})`;
        context.lineWidth = 1;
        context.stroke();
      });
    }
  }, [imageUrl, rectangles]);

  // Render canvas element
  return (
    <>
      {imageUrl && rectangles !== null ? (
        <canvas className={canvasStyle} ref={canvasRef}></canvas>
      ) : (
        <h1>Image can't be loaded</h1>
      )}
    </>
  );
};

export default DetectPage;
