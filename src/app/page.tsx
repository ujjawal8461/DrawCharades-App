"use client";

import { Lobby } from "@/features/lobby/Lobby";
import { Canvas } from "@/features/canvas/Canvas";
import { Sidebar } from "@/components/Sidebar";
import { GameController } from "@/components/GameController";
import { SocketInitializer } from "@/components/SocketInitializer";
import { VotingOverlay } from "@/features/game/VotingOverlay";
import { RoundEndOverlay } from "@/features/game/RoundEndOverlay";
import { useGameStore } from "@/store/useGameStore";
import { useState, useEffect } from "react";
import { socket } from "@/socket/socket";
import { MessageSquare, Users, Award, Menu, X, Eraser, Palette } from "lucide-react";

export default function Home() {
  const { roomCode, gamePhase, currentMovie, me, players, timer, currentDrawerId, isHost } = useGameStore();
  const [color, setColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTools, setShowTools] = useState(true);

  const isMyTurn = me?.id === currentDrawerId;

  if (!roomCode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0f172a] text-white">
        <SocketInitializer />
        <div className="flex flex-col items-center gap-8 w-full max-w-md py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 rotate-12 animate-float">
                <Palette className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter text-center mb-2">
                  Draw<span className="text-indigo-500">Charades</span>
              </h1>
              <p className="text-slate-400 text-center font-medium">The ultimate party drawing game</p>
            </div>
            <div className="w-full glass-panel p-6 rounded-3xl">
              <Lobby />
            </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      <SocketInitializer />
      <GameController />

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Overlays */}
        {gamePhase === "SELECTING" && <VotingOverlay />}
        {gamePhase === "ROUND_END" && <RoundEndOverlay />}

        {/* Top Header Bar */}
        <header className="h-16 md:h-20 px-4 md:px-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-40">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Palette className="w-6 h-6 md:w-7 md:h-7 text-white" />
             </div>
             <div className="hidden sm:block">
                <h2 className="text-sm md:text-lg font-black tracking-tight leading-none">DrawCharades</h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{roomCode}</span>
             </div>
          </div>

          {/* Middle Info: Movie or Status */}
          <div className="flex-1 flex justify-center px-4">
             {gamePhase === "DRAWING" && (
                <div className="flex flex-col items-center">
                   {isMyTurn ? (
                      <div className="bg-indigo-600/20 border border-indigo-500/30 px-4 md:px-8 py-1.5 md:py-2 rounded-full flex items-center gap-2 animate-pulse">
                         <span className="text-[10px] md:text-xs font-bold text-indigo-400 uppercase tracking-widest">Draw:</span>
                         <span className="text-sm md:text-xl font-black text-white">{currentMovie}</span>
                      </div>
                   ) : (
                      <div className="bg-slate-800/50 border border-white/10 px-4 md:px-6 py-1.5 md:py-2 rounded-full flex items-center gap-2">
                         <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Guessing...</span>
                      </div>
                   )}
                </div>
             )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             {/* Timer */}
             <div className={`flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px] h-10 md:h-12 rounded-2xl glass-panel ${timer < 10 ? 'border-rose-500/50' : 'border-emerald-500/50'}`}>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter leading-none mb-0.5">Time</span>
                <span className={`text-sm md:text-xl font-black tabular-nums leading-none ${timer < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                   {timer}s
                </span>
             </div>

             {/* Sidebar Toggle (Mobile) */}
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="md:hidden w-10 h-10 rounded-xl glass-panel flex items-center justify-center relative"
             >
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-slate-900 rounded-full"></div>
             </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-slate-900 overflow-hidden">
          {gamePhase === "LOBBY" ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                <div className="max-w-md space-y-6">
                  <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse border-4 border-indigo-500/30">
                    <Users className="w-12 h-12 text-indigo-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white">Ready to start?</h2>
                  <p className="text-slate-400 font-medium">Wait for all players to join their teams before starting the show.</p>
                  
                  {isHost ? (
                    <button 
                      onClick={() => socket.emit("start_game", roomCode)}
                      className="btn-party px-8 py-4 rounded-2xl text-xl font-bold w-full mt-4"
                    >
                      START THE GAME
                    </button>
                  ) : (
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 inline-block">
                      <p className="text-indigo-400 font-bold animate-pulse uppercase tracking-widest text-sm">Waiting for Host...</p>
                    </div>
                  )}
                </div>
             </div>
          ) : (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full max-w-5xl max-h-[800px] relative">
                   <Canvas color={color} brushSize={brushSize} />
                </div>
             </div>
          )}

          {/* Floating Tool Toolbar */}
          {isMyTurn && gamePhase === "DRAWING" && (
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 z-30 ${showTools ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className="glass-panel p-2 md:p-3 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-4 shadow-2xl border-white/10">
                <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 md:p-2 rounded-xl border border-white/5">
                   {[
                     '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', 
                     '#10b981', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899'
                   ].map(c => (
                     <button
                       key={c}
                       onClick={() => setColor(c)}
                       className={`w-5 h-5 md:w-8 md:h-8 rounded-lg transition-transform active:scale-90 ${color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900 z-10' : 'hover:scale-105'}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                   <div className="relative group">
                      <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-5 h-5 md:w-8 md:h-8 rounded-lg cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                      />
                   </div>
                </div>

                <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

                <div className="flex items-center gap-3 px-2">
                   <div className="flex flex-col items-center">
                     <input 
                        type="range" 
                        min="1" 
                        max="30" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-20 md:w-32 accent-indigo-500 h-1.5 rounded-full appearance-none bg-slate-800 cursor-pointer"
                     />
                   </div>
                   <button 
                     onClick={() => socket.emit("clear_canvas", roomCode)}
                     className="p-2 md:p-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl border border-rose-500/20 transition-all active:scale-90"
                     title="Clear All"
                   >
                     <Eraser className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-80 lg:w-96 flex-col border-l border-white/5 bg-slate-900/50 backdrop-blur-xl z-30">
        <Sidebar />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div 
          className={`absolute inset-y-0 right-0 w-[85%] max-w-sm bg-slate-900 shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-full flex flex-col pt-safe">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
               <h3 className="text-xl font-black">Game Lobby</h3>
               <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-800 rounded-xl">
                  <X className="w-6 h-6" />
               </button>
            </div>
            <div className="flex-1 overflow-hidden">
               <Sidebar />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .pt-safe {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
    </main>
  );
}
