"use client";

import React, { useRef, useEffect, useState } from "react";
import { socket } from "@/socket/socket";
import { useGameStore } from "@/store/useGameStore";

interface CanvasProps {
  width?: number;
  height?: number;
  color?: string;
  brushSize?: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  width = 800,
  height = 600,
  color = "#000000",
  brushSize = 5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution for crisp lines
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Listen for remote drawing
    const handleRemoteDraw = (stroke: any) => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.brushSize;
      ctx.moveTo(stroke.x0, stroke.y0);
      ctx.lineTo(stroke.x1, stroke.y1);
      ctx.stroke();
    };

    const handleRemoteClear = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    };

    socket.on("draw", handleRemoteDraw);
    socket.on("clear_canvas", handleRemoteClear);

    return () => {
      socket.off("draw", handleRemoteDraw);
      socket.off("clear_canvas", handleRemoteClear);
    };
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { currentDrawerId } = useGameStore.getState();
    if (currentDrawerId !== socket.id) return; // Only drawer can draw

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setLastPos({ x, y });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Emit to other players
    const roomCode = useGameStore.getState().roomCode;
    if (roomCode) {
      socket.emit("draw", {
        roomCode,
        stroke: {
          x0: lastPos.x,
          y0: lastPos.y,
          x1: x,
          y1: y,
          color,
          brushSize,
        },
      });
    }

    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  return (
    <div className="relative w-full h-full bg-white border-2 border-gray-300 rounded-lg shadow-inner overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full touch-none cursor-crosshair"
        style={{ touchAction: "none" }}
      />
    </div>
  );
};
