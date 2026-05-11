"use client";

import { Lobby } from "@/features/lobby/Lobby";
import { Canvas } from "@/features/canvas/Canvas";
import { Sidebar } from "@/components/Sidebar";
import { GameController } from "@/components/GameController";
import { SocketInitializer } from "@/components/SocketInitializer";
import { VotingOverlay } from "@/features/game/VotingOverlay";
import { useGameStore } from "@/store/useGameStore";
import { useState } from "react";
import { socket } from "@/socket/socket";

export default function Home() {
  const { roomCode, gamePhase, movieOptions, currentMovie, me, isHost, timer, players } = useGameStore();
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  if (!roomCode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 overflow-y-auto">
        <SocketInitializer />
        <div className="flex flex-col items-center gap-8 w-full max-w-md py-10">
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-600 tracking-tight text-center">
                DrawCharades
            </h1>
            <Lobby />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-100 text-slate-900">
      <SocketInitializer />
      <GameController />

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col p-2 md:p-4 gap-2 md:gap-4 relative overflow-hidden h-[60vh] md:h-full">
        
        {/* Game Overlay for Selecting Movie */}
        {gamePhase === "SELECTING" && <VotingOverlay />}

        {/* Top Bar */}
        <div className="bg-white p-2 md:p-3 rounded-xl shadow-sm flex justify-between items-center border border-gray-200">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            {me?.id === useGameStore.getState().currentDrawerId ? (
              <div className="flex gap-2 p-1 bg-gray-50 rounded-lg border border-gray-200 items-center shrink-0">
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 md:w-8 md:h-8 cursor-pointer bg-transparent border-none"
                />
                <div className="h-4 w-[1px] bg-gray-300"></div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-16 md:w-24 cursor-pointer accent-indigo-600"
                />
                <button 
                  onClick={() => socket.emit("clear_canvas", roomCode)}
                  className="ml-1 md:ml-2 px-3 py-1.5 bg-rose-500 text-white rounded-lg font-bold text-[10px] md:text-xs hover:bg-rose-600 active:scale-95 transition-all shadow-sm"
                >
                  CLEAR
                </button>
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100 whitespace-nowrap">
                <p className="text-[10px] md:text-sm font-bold text-indigo-600 truncate max-w-[120px] md:max-w-none">
                  🖌️ {players.find(p => p.id === useGameStore.getState().currentDrawerId)?.name || "Drawer"} is drawing...
                </p>
              </div>
            )}
          </div>

          {currentMovie && me?.id === useGameStore.getState().currentDrawerId && (
            <div className="hidden sm:block bg-indigo-600 text-white px-4 py-1.5 rounded-lg shadow-md border border-indigo-700 mx-2">
               <p className="text-[10px] font-bold text-center leading-tight">{currentMovie}</p>
            </div>
          )}

          <div className="flex gap-2 items-center bg-gray-900 text-white p-1.5 md:p-2 px-3 md:px-4 rounded-xl shrink-0">
             <div className="text-center">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">Time</p>
                <p className={`text-sm md:text-xl font-bold tabular-nums ${timer < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </p>
             </div>
          </div>
        </div>

        {/* Canvas Wrapper */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
          {gamePhase === "LOBBY" ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 gap-4 p-4 text-center">
                {isHost ? (
                  <>
                    <p className="text-gray-600 font-bold text-sm md:text-base">Cast is ready!</p>
                    <button 
                      onClick={() => socket.emit("start_game", roomCode)}
                      className="p-4 md:p-6 bg-indigo-600 text-white text-xl md:text-3xl font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                    >
                      START GAME
                    </button>
                  </>
                ) : (
                  <p className="text-gray-400 font-bold text-sm md:text-lg animate-pulse">Waiting for host...</p>
                )}
             </div>
          ) : (
             <Canvas color={color} brushSize={brushSize} />
          )}
          
          {/* Mobile Movie Name Badge */}
          {currentMovie && me?.id === useGameStore.getState().currentDrawerId && (
            <div className="sm:hidden absolute top-2 right-2 bg-indigo-600/90 text-white px-3 py-1 rounded-full text-[10px] font-bold">
               {currentMovie}
            </div>
          )}
        </div>
      </div>

      {/* Side Panel (Chat & Scores) */}
      <div className="h-[40vh] md:h-full md:w-80 lg:w-96 shrink-0 border-t md:border-t-0 md:border-l border-gray-200 bg-white shadow-lg z-30">
        <Sidebar />
      </div>
    </main>
  );
}
