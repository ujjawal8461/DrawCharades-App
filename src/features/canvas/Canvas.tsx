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
    <div className="relative w-full h-full bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden border-8 border-slate-800 ring-1 ring-white/10 group">
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

      {/* Subtle corner decorations */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-200 rounded-tl-lg pointer-events-none"></div>
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-200 rounded-tr-lg pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-200 rounded-bl-lg pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-200 rounded-br-lg pointer-events-none"></div>
    </div>
  );
};
