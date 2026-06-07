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
  color = "#6366f1",
  brushSize = 5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Save current content
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Restore content
      ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr, 0, 0, rect.width, rect.height);
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    
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
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    };

    socket.on("draw", handleRemoteDraw);
    socket.on("clear_canvas", handleRemoteClear);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
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
    <div className="relative w-full h-full bg-white rounded-3xl shadow-[8px_8px_0px_0px_#1e293b] border-4 border-slate-800 flex flex-col overflow-hidden group">
      {/* Spiral binding rings at the top */}
      <div className="h-10 bg-amber-50/80 border-b-4 border-slate-800 flex justify-around px-8 items-center z-20 relative shrink-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="relative w-3 h-8 flex flex-col items-center">
            {/* The metal ring looping over */}
            <div className="absolute top-[-8px] w-2.5 h-10 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-full border-2 border-slate-800 shadow-sm z-30"></div>
            {/* Ring hole in paper */}
            <div className="absolute top-[8px] w-2.5 h-2.5 bg-slate-800 rounded-full z-20"></div>
          </div>
        ))}
      </div>

      <div className="flex-1 relative bg-white">
        {/* Background pattern for paper feel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full touch-none cursor-crosshair relative z-10"
          style={{ touchAction: "none" }}
        />
        
        {/* Simple red margin sketch line on left side */}
        <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-200 pointer-events-none z-10"></div>
      </div>
    </div>
  );
};
