import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle, Text } from "react-konva";

const InfiniteCanvas = () => {
  const [shapes, setShapes] = useState([]);
  const [currentTool, setCurrentTool] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const stageRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        handleDuplicateShape();
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedShape, shapes, history, redoStack]);

  const addHistory = (newShapes) => {
    setHistory([...history, shapes]);
    setShapes(newShapes);
    setRedoStack([]);
  };

  const handleMouseDown = (e) => {
    if (!currentTool) return;

    setDrawing(true);
    const { x, y } = e.target.getStage().getPointerPosition();

    if (currentTool === "line") {
      setCurrentShape({
        type: "line",
        points: [x, y, x, y],
        stroke: "black",
        strokeWidth: 2,
      });
    } else if (currentTool === "circle") {
      setCurrentShape({
        type: "circle",
        x,
        y,
        radius: 0,
        stroke: "black",
        strokeWidth: 2,
      });
    } else if (currentTool === "text") {
      const text = window.prompt("Enter text:", "Text");
      setCurrentShape({ type: "text", x, y, text, fontSize: 20 });
      addHistory([...shapes, { type: "text", x, y, text, fontSize: 20 }]);
      setCurrentTool(null); // Reset tool after drawing
      setCurrentShape(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;

    const { x, y } = e.target.getStage().getPointerPosition();

    if (currentTool === "line") {
      const newLine = {
        ...currentShape,
        points: [currentShape.points[0], currentShape.points[1], x, y],
      };
      setCurrentShape(newLine);
    } else if (currentTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(x - currentShape.x, 2) + Math.pow(y - currentShape.y, 2)
      );
      const newCircle = { ...currentShape, radius };
      setCurrentShape(newCircle);
    }
  };

  const handleMouseUp = () => {
    if (!currentTool) return;

    setDrawing(false);
    addHistory([...shapes, currentShape]);
    setCurrentTool(null); // Reset tool after drawing
    setCurrentShape(null);
  };

  const handleSelectShape = (shape, index) => {
    setSelectedShape({ ...shape, index });
  };

  const handleDragMove = (e, index) => {
    const newShapes = shapes.slice();
    const { x, y } = e.target.position();
    if (newShapes[index].type === "line") {
      const offsetX = x - newShapes[index].points[0];
      const offsetY = y - newShapes[index].points[1];
      newShapes[index].points = newShapes[index].points.map((point, i) =>
        i % 2 === 0 ? point + offsetX : point + offsetY
      );
    } else {
      newShapes[index].x = x;
      newShapes[index].y = y;
    }
    setShapes(newShapes);
  };

  const handleDeleteShape = () => {
    if (selectedShape) {
      const newShapes = shapes.filter((_, i) => i !== selectedShape.index);
      addHistory(newShapes);
      setSelectedShape(null);
    }
  };

  const handleClearCanvas = () => {
    addHistory([]);
  };

  const handleDownload = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDuplicateShape = () => {
    if (selectedShape) {
      let newShape;
      const { x, y } = selectedShape;
      if (selectedShape.type === "text") {
        newShape = { ...selectedShape, x: x + 10, y: y + 10 };
      } else if (selectedShape.type === "line") {
        const offsetX = 10;
        const offsetY = 10;
        newShape = {
          ...selectedShape,
          points: selectedShape.points.map(
            (p, i) => p + (i % 2 === 0 ? offsetX : offsetY)
          ),
        };
      } else if (selectedShape.type === "circle") {
        newShape = { ...selectedShape, x: x + 10, y: y + 10 };
      }
      addHistory([...shapes, newShape]);
      setSelectedShape(null); // Optionally, deselect after duplication
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousShapes = history[history.length - 1];
      setRedoStack([shapes, ...redoStack]);
      setShapes(previousShapes);
      setHistory(history.slice(0, history.length - 1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextShapes = redoStack[0];
      setHistory([...history, shapes]);
      setShapes(nextShapes);
      setRedoStack(redoStack.slice(1));
    }
  };

  const setToolAndDeselect = (tool) => {
    setCurrentTool(tool);
    setSelectedShape(null);
  };

  const renderShape = (shape, i) => {
    const isSelected = selectedShape && selectedShape.index === i;

    if (shape.type === "line") {
      return (
        <Line
          key={i}
          points={shape.points}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          draggable
          onClick={() => handleSelectShape(shape, i)}
          onDragMove={(e) => handleDragMove(e, i)}
        />
      );
    } else if (shape.type === "circle") {
      return (
        <Circle
          key={i}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          draggable
          onClick={() => handleSelectShape(shape, i)}
          onDragMove={(e) => handleDragMove(e, i)}
        />
      );
    } else if (shape.type === "text") {
      return (
        <Text
          key={i}
          x={shape.x}
          y={shape.y}
          text={shape.text}
          fontSize={shape.fontSize}
          draggable
          onClick={() => handleSelectShape(shape, i)}
          onDragMove={(e) => handleDragMove(e, i)}
        />
      );
    }

    return null;
  };

  const renderShapeWithOutline = (shape, i) => {
    const isSelected = selectedShape && selectedShape.index === i;

    return (
      <React.Fragment key={i}>
        {isSelected && (
          <React.Fragment>
            {shape.type === "line" && (
              <Line
                points={shape.points}
                stroke="blue"
                strokeWidth={shape.strokeWidth + 2}
                dash={[10, 5]}
                listening={false}
              />
            )}
            {shape.type === "circle" && (
              <Circle
                x={shape.x}
                y={shape.y}
                radius={shape.radius}
                stroke="blue"
                strokeWidth={shape.strokeWidth + 2}
                dash={[10, 5]}
                listening={false}
              />
            )}
            {shape.type === "text" && (
              <Text
                x={shape.x}
                y={shape.y}
                text={shape.text}
                fontSize={shape.fontSize}
                stroke="blue"
                strokeWidth={2}
                listening={false}
              />
            )}
          </React.Fragment>
        )}
        {renderShape(shape, i)}
      </React.Fragment>
    );
  };

  return (
    <div>
      <div>
        <button onClick={() => setToolAndDeselect("line")}>Line</button>
        <button onClick={() => setToolAndDeselect("circle")}>Circle</button>
        <button onClick={() => setToolAndDeselect("text")}>Text</button>
        <button onClick={handleDeleteShape}>Delete</button>
        <button onClick={handleDuplicateShape}>Duplicate</button>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
        <button onClick={handleClearCanvas}>Clear</button>
        <button onClick={handleDownload}>Download</button>
      </div>
      <div
        style={{
          border: "1px solid black",
          width: "800px",
          height: "600px",
          overflow: "hidden",
        }}
      >
        <Stage
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {shapes.map(renderShapeWithOutline)}
            {currentShape && currentTool === "line" && (
              <Line
                points={currentShape.points}
                stroke="black"
                strokeWidth={2}
              />
            )}
            {currentShape && currentTool === "circle" && (
              <Circle
                x={currentShape.x}
                y={currentShape.y}
                radius={currentShape.radius}
                stroke="black"
                strokeWidth={2}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default InfiniteCanvas;
