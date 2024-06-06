import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle, Text } from "react-konva";
import CircleIcon from "./icons/CircleIcon";
import ClearIcon from "./icons/ClearIcon";
import DeleteIcon from "./icons/DeleteIcon";
import DownloadIcon from "./icons/DownloadIcon";
import DuplicateIcon from "./icons/DuplicateIcon";
import LineIcon from "./icons/LineIcon";
import RedoIcon from "./icons/RedoIcon";
import TextIcon from "./icons/TextIcon";
import UndoIcon from "./icons/UndoIcon";

const InfiniteCanvas = () => {
  const [shapes, setShapes] = useState([]);
  const [currentTool, setCurrentTool] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
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
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    const pointerPosition = stage.getPointerPosition();
    const adjustedPosition = {
      x: (pointerPosition.x - stage.x()) / stage.scaleX(),
      y: (pointerPosition.y - stage.y()) / stage.scaleY(),
    };

    if (currentTool === "line") {
      setCurrentShape({
        type: "line",
        points: [
          adjustedPosition.x,
          adjustedPosition.y,
          adjustedPosition.x,
          adjustedPosition.y,
        ],
        stroke: "black",
        strokeWidth: 2,
      });
    } else if (currentTool === "circle") {
      setCurrentShape({
        type: "circle",
        x: adjustedPosition.x,
        y: adjustedPosition.y,
        radius: 0,
        stroke: "black",
        strokeWidth: 2,
      });
    } else if (currentTool === "text") {
      const text = window.prompt("Enter text:", "Text");
      setCurrentShape({
        type: "text",
        x: adjustedPosition.x,
        y: adjustedPosition.y,
        text,
        fontSize: 20,
      });
      addHistory([
        ...shapes,
        {
          type: "text",
          x: adjustedPosition.x,
          y: adjustedPosition.y,
          text,
          fontSize: 20,
        },
      ]);
      setCurrentTool(null); // Reset tool after drawing
      setCurrentShape(null);
    }
    stageRef.current.setDraggable(false);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const adjustedPosition = {
      x: (pointerPosition.x - stage.x()) / stage.scaleX(),
      y: (pointerPosition.y - stage.y()) / stage.scaleY(),
    };

    if (currentTool === "line") {
      const newLine = {
        ...currentShape,
        points: [
          currentShape.points[0],
          currentShape.points[1],
          adjustedPosition.x,
          adjustedPosition.y,
        ],
      };
      setCurrentShape(newLine);
    } else if (currentTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(adjustedPosition.x - currentShape.x, 2) +
          Math.pow(adjustedPosition.y - currentShape.y, 2)
      );
      const newCircle = { ...currentShape, radius };
      setCurrentShape(newCircle);
    }
  };

  const handleMouseUp = () => {
    if (!currentTool) return;

    setDrawing(false);
    addHistory([...shapes, currentShape]);
    setCurrentTool(null);
    setCurrentShape(null);
    stageRef.current.setDraggable(true);
  };

  const handleSelectShape = (shape, index) => {
    setSelectedShape({ ...shape, index });
  };

  const handleDragMove = (e, index) => {
    const stage = e.target.getStage();
    const newShapes = shapes.slice();
    const { x, y } = stage.getPointerPosition();
    const adjustedPosition = {
      x: (x - stage.x()) / stage.scaleX(),
      y: (y - stage.y()) / stage.scaleY(),
    };

    if (newShapes[index].type === "line") {
      const offsetX = adjustedPosition.x - newShapes[index].points[0];
      const offsetY = adjustedPosition.y - newShapes[index].points[1];
      newShapes[index].points = newShapes[index].points.map((point, i) =>
        i % 2 === 0 ? point + offsetX : point + offsetY
      );
    } else {
      newShapes[index].x = adjustedPosition.x;
      newShapes[index].y = adjustedPosition.y;
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
    link.download = "canvas.jpg";
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
      setSelectedShape(null);
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

  const renderGridLines = () => {
    const gridSize = 50; // Set the size of the grid squares
    const width = window.innerWidth * 100; // Stage width
    const height = window.innerHeight * 100; // Stage height
    const lines = [];

    // Vertical lines
    for (let i = 0; i < width / gridSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, height]}
          stroke="#ccc"
          strokeWidth={0.5}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i < height / gridSize; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, width, i * gridSize]}
          stroke="#ccc"
          strokeWidth={0.5}
        />
      );
    }

    return lines;
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.batchDraw();

    setIsZoomed(newScale !== 1); // Update zoom state
  };

  const handleDragEnd = (e) => {
    const stage = stageRef.current;
    const newPos = stage.position();
    stage.position(newPos);
  };

  // Calculate initial position to center the grid
  const initialPosition = {
    x:
      window.innerWidth / 2 -
      (window.innerWidth * 100) / 2 +
      window.innerWidth / 2,
    y:
      window.innerHeight / 2 -
      (window.innerHeight * 100) / 2 +
      window.innerHeight / 2,
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "line" ? "bg-violet-500 text-white" : ""}`}
          onClick={() => setToolAndDeselect("line")}
        >
          <LineIcon />
        </button>

        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "circle" ? "bg-violet-500 text-white" : ""}`}
          onClick={() => setToolAndDeselect("circle")}
        >
          <CircleIcon />
        </button>
        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "text" ? "bg-violet-500 text-white" : ""}`}
          onClick={() => setToolAndDeselect("text")}
        >
          <TextIcon />
        </button>
        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "delete" ? "bg-violet-500 text-white" : ""}`}
          onClick={handleDeleteShape}
        >
          <DeleteIcon />
        </button>
        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "duplicate" ? "bg-violet-500 text-white" : ""}`}
          onClick={handleDuplicateShape}
        >
          <DuplicateIcon />
        </button>
        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "undo" ? "bg-violet-500 text-white" : ""}`}
          onClick={handleUndo}
        >
          <UndoIcon />
        </button>
        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "redo" ? "bg-violet-500 text-white" : ""}`}
          onClick={handleRedo}
        >
          <RedoIcon />
        </button>
        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "clear" ? "bg-violet-500 text-white" : ""}`}
          onClick={handleClearCanvas}
        >
          <ClearIcon />
        </button>
        <button
          className={`px-3 py-2 rounded-md ml-4 border border-black hover:bg-gray-100 
  ${currentTool === "download" ? "bg-violet-500 text-white" : ""}`}
          onClick={handleDownload}
        >
          <DownloadIcon />
        </button>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
          draggable={isZoomed}
          onDragEnd={handleDragEnd}
          onWheel={handleWheel}
          x={initialPosition.x}
          y={initialPosition.y}
        >
          <Layer>
            {renderGridLines()}
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
