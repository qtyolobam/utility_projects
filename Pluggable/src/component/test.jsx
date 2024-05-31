import { useRef, useEffect } from "preact/hooks";

const DetectPage = ({ imageUrl, rectangles }) => {
  // Ref to the canvas element
  const canvasRef = useRef(null);

  // Array to store used colors
  let usedColors = [];

  useEffect(() => {
    // Function to get a random bright and unique color
    const getRandomColor = (usedColors) => {
      const randomChannel = () => Math.floor(Math.random() * 256); 
      const isBright = (r, g, b) => (r + g + b) / 3 > 127; 
    
      let color;
      do {
        color = [randomChannel(), randomChannel(), randomChannel()]; // Store RGB values as an array
      } while (!isBright(...color) || usedColors.some(usedColor => usedColor.every((value, index) => value === color[index]))); // Check for brightness and uniqueness 
    
      return color;
    };

    // Function to update canvas size and draw rectangles
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return; 
      const context = canvas.getContext("2d");

      const image = new Image();
      image.src = ;
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    // Load image and update canvas size when image is loaded
    const canvas = canvasRef.current;
    if (!canvas) return; 
    const context = canvas.getContext("2d");

    const image = new Image();
    image.src = imageUrl;
    image.onload = updateCanvasSize;

    // Update canvas size when window is resized
    window.addEventListener("resize", updateCanvasSize);

    // Remove resize event listener when component unmounts
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [imageUrl, rectangles]);

  // Render canvas element
  return (
    <div>
      {imageUrl && rectangles !==null ?  (
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }}></canvas>
      ) : (
        <h1>Image can't be loaded</h1>
      )}
    </div>
  );
};

export default DetectPage;