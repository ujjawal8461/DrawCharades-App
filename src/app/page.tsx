"use client";

import { Lobby } from "@/features/lobby/Lobby";
import { Canvas } from "@/features/canvas/Canvas";
import { Sidebar } from "@/components/Sidebar";
import { GameController } from "@/components/GameController";
import { SocketInitializer } from "@/components/SocketInitializer";
import { VotingOverlay } from "@/features/game/VotingOverlay";
import { RoundEndOverlay } from "@/features/game/RoundEndOverlay";
import { useGameStore } from "@/store/useGameStore";
import { useState } from "react";
import { socket } from "@/socket/socket";
import { MessageSquare, X, Eraser, Palette } from "lucide-react";

export default function Home() {
  const { roomCode, gamePhase, currentMovie, me, timer, currentDrawerId } = useGameStore();
  const [color, setColor] = useState("#3b82f6"); // Default blue crayon shade
  const [brushSize, setBrushSize] = useState(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTools] = useState(true);

  const isMyTurn = me?.id === currentDrawerId;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs < 10 ? "0" : ""}${secs}` : `${secs}s`;
  };

  // Background Doodles helper (looks like wobbly mouse/cursor drawn paint sketches)
  const BackgroundDoodles = () => (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
      {/* MS Paint Sun */}
      <svg viewBox="0 0 24 24" className="w-20 h-20 text-yellow-500/25 absolute right-[3%] top-[3%] pointer-events-none select-none hidden md:block">
        <path d="M12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22M5 5L7.5 7.5M16.5 16.5L19 19M19 5L16.5 7.5M7.5 16.5L5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* Shaky Stick Figure Character */}
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-slate-350 opacity-40 absolute left-[6%] top-[14%] rotate-6 pointer-events-none select-none hidden md:block">
        <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M12 10L12 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M7 12.5C9 13.5 12 11.5 17 12.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 17L9 22M12 17L15 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* Shaky Spectacles (Top Middle-Left) */}
      <svg viewBox="0 0 24 24" className="w-14 h-14 text-slate-300 opacity-40 absolute left-[38%] top-[6%] rotate-[-5deg] pointer-events-none select-none hidden xl:block">
        <circle cx="7" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="17" cy="12" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M11 12C12 11 12 11 13 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M3 12L4 9M21 12L20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Wobbly Rocket (Top Middle-Right) */}
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-rose-500/20 absolute right-[35%] top-[10%] rotate-[45deg] pointer-events-none select-none hidden xl:block">
        <path d="M12 2C12 2 8 6 8 13C8 16 10 18 12 18C14 18 16 16 16 13C16 6 12 2 12 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 15L4 18V21L8 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 15L20 18V21L16 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 20L12 22L13 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>

      {/* Wobbly Butterfly (Upper Left) */}
      <svg viewBox="0 0 24 24" className="w-12 h-12 text-pink-500/25 absolute left-[3%] top-[28%] rotate-[-20deg] pointer-events-none select-none hidden md:block">
        <path d="M12 5V19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 8C9 4 5 6 7 11C5 15 9 17 12 14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8C15 4 19 6 17 11C19 15 15 17 12 14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 5C11 3 9 3 9 3M12 5C13 3 15 3 15 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>

      {/* Shaky Tree */}
      <svg viewBox="0 0 24 24" className="w-20 h-20 text-emerald-500/20 absolute left-[3%] top-[45%] rotate-[-6deg] pointer-events-none select-none hidden md:block">
        <path d="M11 16L10 22M13 16L14 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 4C9 4 7 6 7 8C6 8 5 9 5 10C5 11.5 6.5 12 8 12C7 13 7.5 14 9 14.5C10.5 15 13.5 15 15 14C16.5 13 17 12 17 11.5C18 11.5 19 10.5 19 9C19 7.5 17 6 15.5 6C15 4.5 13.5 4 12 4Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Shaky House */}
      <svg viewBox="0 0 24 24" className="w-18 h-18 text-rose-500/20 absolute right-[25%] top-[50%] rotate-6 pointer-events-none select-none hidden lg:block">
        <path d="M3 11L12 4L21 11" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 11V21H19V11" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 21V16H14V21" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="8" y="13" width="3" height="3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Wobbly Cloud */}
      <svg viewBox="0 0 24 24" className="w-20 h-20 text-slate-350 opacity-40 absolute right-[10%] bottom-[32%] pointer-events-none select-none hidden lg:block">
        <path d="M6 15C5 15 4 14 4 13C4 11.5 5 11 6 11C5.5 9.5 7 8 8.5 8C9 6.5 11 5 13.5 5C16.5 5 18 7 18 8.5C19 8.5 20 9.5 20 11C20 12 19 13 18.5 13C19 14 18.5 15 17 15.5H6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Wobbly Flower / Star */}
      <svg viewBox="0 0 24 24" className="w-12 h-12 text-sky-500/25 absolute left-[22%] top-[30%] rotate-[10deg] pointer-events-none select-none hidden lg:block">
        <path d="M12 2C11 5 8 5 8 8C5 8 5 11 2 12C5 13 5 16 8 16C8 19 11 19 12 22C13 19 16 19 16 16C19 16 19 13 22 12C19 11 19 8 16 8C16 5 13 5 12 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Wobbly Cat Face (Lower Left) */}
      <svg viewBox="0 0 24 24" className="w-14 h-14 text-orange-400/20 absolute left-[15%] bottom-[25%] rotate-[15deg] pointer-events-none select-none hidden xl:block">
        <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M5.5 10L4 4L9 7.5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 10L20 4L15 7.5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.5" cy="11.5" r="1" fill="currentColor" />
        <circle cx="14.5" cy="11.5" r="1" fill="currentColor" />
        <path d="M11 14.5L12 15.5L13 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 17C10.5 18 13.5 18 14 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>

      {/* Shaky Movie Reel */}
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-rose-500/25 absolute left-[5%] bottom-[12%] -rotate-[15deg] pointer-events-none select-none hidden md:block">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M12 6.5V17.5M6.5 12H17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Wobbly Sailboat (Lower Right) */}
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-blue-500/20 absolute right-[18%] bottom-[8%] -rotate-[10deg] pointer-events-none select-none hidden lg:block">
        <path d="M4 14C8 14 16 14 20 14L17 19H7L4 14Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 14V3L6 10H12L18 8L12 14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 21C5 20.5 7 21.5 10 21C13 20.5 15 21.5 18 21C20 20.5 22 21 22 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>

      {/* Curly Crayon Swirl */}
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-slate-300 opacity-60 absolute left-[30%] bottom-[8%] rotate-[5deg] pointer-events-none select-none hidden xl:block">
        <path d="M3 17C6 11 11 9 16 12C18.5 13.5 19 16.5 17 18.5C15 20.5 12 19.5 11.5 17C11 13 14.5 7 21 5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* NEW: Shaky UFO / Alien (Top Right) */}
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-indigo-500/20 absolute right-[8%] top-[25%] rotate-[-12deg] pointer-events-none select-none hidden lg:block">
        <path d="M9 12C9 9 10.5 7 12 7C13.5 7 15 9 15 12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M4 14C3 13.5 3.5 12 6 12C9 12 15 12 18 12C20.5 12 21 13.5 20 14C18 15.5 15 16 12 16C9 16 6 15.5 4 14Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="14" r="0.8" fill="currentColor" />
        <circle cx="12" cy="14" r="0.8" fill="currentColor" />
        <circle cx="17" cy="14" r="0.8" fill="currentColor" />
        <path d="M7 16L5 20M12 16L12 21M17 16L19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* NEW: Wobbly Paper Plane (Top Left-Center) */}
      <svg viewBox="0 0 24 24" className="w-14 h-14 text-slate-350 opacity-40 absolute left-[22%] top-[18%] rotate-[15deg] pointer-events-none select-none hidden xl:block">
        <path d="M2.5 11.8L21.8 2.2L14.7 21.5L11.2 13.1L2.5 11.8ZM11.2 13.1L21.8 2.2" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* NEW: Shaky Smiling Pencil (Top Right-Center) */}
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-yellow-500/20 absolute right-[12%] top-[15%] rotate-[-30deg] pointer-events-none select-none hidden xl:block">
        <path d="M5 19L17 7L19 9L7 21L5 19Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 19L3 21L5 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M17 7L18.5 5.5L20.5 7.5L19 9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="11" cy="12" r="0.8" fill="currentColor" />
        <circle cx="13" cy="14" r="0.8" fill="currentColor" />
        <path d="M11.5 14C12 14.5 12.5 14.5 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>

      {/* NEW: Wobbly Heart (Left Center) */}
      <svg viewBox="0 0 24 24" className="w-12 h-12 text-rose-500/25 absolute left-[10%] top-[38%] rotate-[10deg] pointer-events-none select-none hidden xl:block">
        <path d="M12 21C12 21 3 15 3 9C3 5.5 5.5 3 9 3C10.5 3 11.5 4 12 5C12.5 4 13.5 3 15 3C18.5 3 21 5.5 21 9C21 15 12 21 12 21Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* NEW: Wobbly Crown (Top Center) */}
      <svg viewBox="0 0 24 24" className="w-14 h-14 text-amber-500/25 absolute left-[45%] top-[12%] rotate-[-8deg] pointer-events-none select-none hidden xl:block">
        <path d="M4 18L2 8L7 12L12 5L17 12L22 8L20 18H4Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="2" cy="7" r="0.8" fill="currentColor" />
        <circle cx="12" cy="4" r="0.8" fill="currentColor" />
        <circle cx="22" cy="7" r="0.8" fill="currentColor" />
      </svg>



      {/* NEW: Wobbly Ice Cream Cone (Right Bottom-Center) */}
      <svg viewBox="0 0 24 24" className="w-16 h-16 text-orange-400/20 absolute right-[32%] bottom-[20%] rotate-[-15deg] pointer-events-none select-none hidden xl:block">
        <path d="M7 11L12 21L17 11Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 11C6 11 5 10 5 8.5C5 6.5 8 5 12 5C16 5 19 6.5 19 8.5C19 10 18 11 17 11" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M8 8.5C7 8.5 6.5 7.5 6.5 6.5C6.5 4.5 9 3 12 3C15 3 17.5 4.5 17.5 6.5C17.5 7.5 17 8.5 16 8.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="12" cy="1.8" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>

      {/* NEW: Wobbly Coffee Cup (Left Bottom-Center) */}
      <svg viewBox="0 0 24 24" className="w-14 h-14 text-yellow-600/20 absolute left-[28%] bottom-[22%] rotate-[8deg] pointer-events-none select-none hidden xl:block">
        <path d="M5 9V17C5 19 7 20 10 20H14C17 20 19 19 19 17V9H5Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 11C21 11 22 12 22 13.5C22 15 21 16 19 16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M8 6C8.5 5 8.5 4 8 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 6C12.5 5 12.5 4 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 6C16.5 5 16.5 4 16 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* NEW: Wobbly Fish (Right Bottom-Edge) */}
      <svg viewBox="0 0 24 24" className="w-14 h-14 text-sky-500/20 absolute right-[5%] bottom-[18%] rotate-[-5deg] pointer-events-none select-none hidden md:block">
        <path d="M12 7C7 7 4 10 4 12C4 14 7 17 12 17C15 17 18 15 19 13.5L22 16V8L19 10.5C18 9 15 7 12 7Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="11" r="1.2" fill="currentColor" />
        <path d="M14 11C13 12 13 13 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>

      {/* NEW: Wobbly Rainbow (Bottom Center) */}
      <svg viewBox="0 0 24 24" className="w-24 h-16 text-amber-500/20 absolute left-[45%] bottom-[4%] rotate-[-3deg] pointer-events-none select-none hidden lg:block">
        <path d="M3 18C4 13 8 9 12 9C16 9 20 13 21 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M5 19C6 15 9 11 12 11C15 11 18 15 19 19" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M7 20C8 17 10 13 12 13C14 13 16 17 17 20" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );

  if (!roomCode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 select-none relative overflow-hidden">
        <SocketInitializer />
        <BackgroundDoodles />
        
        {/* Main Landing Layout */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-10 py-10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Centered Main Header / Logo */}
            <div className="flex flex-col items-center text-center">
              <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter">
                  Draw<span className="text-sky-500">Charades</span>
              </h1>
              <p className="text-slate-500 font-bold handwritten text-lg mt-1">The ultimate party drawing game</p>
            </div>

            {/* Split Columns of Equal Height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-8 w-full relative z-10">
                
                {/* Left Column: Sketchbook Game Guide */}
                <div className="sketch-panel p-6 bg-white border-3 border-slate-800 flex flex-col gap-4 shadow-[6px_6px_0px_0px_#1e293b]">
                  <h3 className="text-2xl font-black text-slate-800 border-b-2 border-slate-200 pb-2">How to Play 🎨🎬</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-stretch">
                    {/* Step 1: Blue */}
                    <div className="p-4 bg-sky-50 border-2 border-sky-400 rounded-2xl flex gap-3 shadow-[2px_2px_0px_0px_#0369a1]">
                      <span className="text-2xl font-black text-sky-600 shrink-0">1</span>
                      <div>
                        <h4 className="font-black text-sm text-sky-900 leading-tight">Gather the Crew</h4>
                        <p className="text-xs text-sky-700 font-bold leading-normal mt-1">Minimum 4 players needed. Teams A & B are auto-assigned.</p>
                      </div>
                    </div>
                    
                    {/* Step 2: Red */}
                    <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-2xl flex gap-3 shadow-[2px_2px_0px_0px_#9f1239]">
                      <span className="text-2xl font-black text-rose-600 shrink-0">2</span>
                      <div>
                        <h4 className="font-black text-sm text-rose-900 leading-tight">Pick a Movie</h4>
                        <p className="text-xs text-rose-700 font-bold leading-normal mt-1">One team votes on a secret movie for the opposing drawer!</p>
                      </div>
                    </div>

                    {/* Step 3: Yellow */}
                    <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex gap-3 shadow-[2px_2px_0px_0px_#854d0e]">
                      <span className="text-2xl font-black text-amber-600 shrink-0">3</span>
                      <div>
                        <h4 className="font-black text-sm text-amber-900 leading-tight">Draw the Clues</h4>
                        <p className="text-xs text-amber-700 font-bold leading-normal mt-1">Draw on the shared canvas. No letters, numbers, or talking!</p>
                      </div>
                    </div>

                    {/* Step 4: Green */}
                    <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex gap-3 shadow-[2px_2px_0px_0px_#065f46]">
                      <span className="text-2xl font-black text-emerald-600 shrink-0">4</span>
                      <div>
                        <h4 className="font-black text-sm text-emerald-900 leading-tight">Guess & Score</h4>
                        <p className="text-xs text-emerald-700 font-bold leading-normal mt-1">Type answers in the chat. The first correct guess wins points for the team!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Lobby Card */}
                <div className="sketch-panel p-6 bg-white border-3 border-slate-800 shadow-[6px_6px_0px_0px_#1e293b] flex flex-col justify-center">
                  <Lobby />
                </div>
            </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-screen overflow-hidden text-slate-800 font-sans select-none relative">
      <SocketInitializer />
      <GameController />

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50 z-10">
        <BackgroundDoodles />
        
        {/* Top Header Bar */}
        <header className="h-16 md:h-20 px-4 md:px-6 flex items-center justify-between border-b-3 border-slate-800 bg-white z-40 shadow-sm relative shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-400 border-2 border-slate-800 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1e293b]">
                <Palette className="w-6 h-6 md:w-7 md:h-7 text-slate-800" />
             </div>
             <div className="hidden sm:block">
                <h2 className="text-sm md:text-lg font-black tracking-tight leading-none text-slate-800">DrawCharades</h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{roomCode}</span>
             </div>
          </div>

          {/* Middle Info: Movie or Status */}
          <div className="flex-1 flex justify-center px-4">
             {gamePhase === "DRAWING" && (
                <div className="flex flex-col items-center">
                   {isMyTurn ? (
                      <div className="bg-rose-50 border-2 border-rose-800 px-4 md:px-8 py-1.5 md:py-2 rounded-full flex items-center gap-2 animate-pulse text-rose-900 font-bold">
                         <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-rose-700">Draw:</span>
                         <span className="text-sm md:text-xl font-black">{currentMovie}</span>
                      </div>
                   ) : (
                      <div className="bg-sky-50 border-2 border-sky-800 px-4 md:px-6 py-1.5 md:py-2 rounded-full flex items-center gap-2 text-sky-900 font-bold">
                         <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-sky-700">Guessing...</span>
                      </div>
                   )}
                </div>
             )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             {/* Timer */}
             <div className={`flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px] h-10 md:h-12 rounded-2xl border-2 bg-white ${
                timer < 10 
                  ? 'border-rose-500 text-rose-600 bg-rose-50 shadow-[2px_2px_0px_0px_#f43f5e]' 
                  : 'border-emerald-500 text-emerald-600 bg-emerald-50 shadow-[2px_2px_0px_0px_#10b981]'
              }`}>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Time</span>
                <span className="text-sm md:text-xl font-black tabular-nums leading-none">
                   {formatTime(timer)}
                </span>
             </div>

             {/* Sidebar Toggle (Mobile) */}
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="md:hidden w-10 h-10 rounded-xl border-2 border-slate-800 bg-white flex items-center justify-center relative shadow-[2px_2px_0px_0px_#1e293b] active:translate-y-[1px]"
             >
                <MessageSquare className="w-5 h-5 text-sky-650" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-slate-800 rounded-full"></div>
             </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 z-10">
          {gamePhase === "LOBBY" ? (
             <div className="absolute inset-0 flex flex-col items-center p-4 md:p-8 z-10 overflow-y-auto bg-transparent">
                <div className="w-full max-w-4xl py-6">
                   <Lobby />
                </div>
             </div>
          ) : (
             <div className="w-full h-full max-w-5xl max-h-[720px] relative flex items-center justify-center">
                <Canvas color={color} brushSize={brushSize} />
             </div>
          )}

          {/* Floating Tool Toolbar */}
          {isMyTurn && gamePhase === "DRAWING" && (
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 z-30 ${showTools ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className="sketch-panel p-2 md:p-3 bg-white border-3 border-slate-800 flex items-center gap-2 md:gap-4 shadow-[4px_4px_0px_0px_#1e293b]">
                {/* Crayon Color Selectors */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 md:p-2 rounded-xl border-2 border-slate-300">
                   {[
                     '#ffffff', '#000000', '#f43f5e', '#fb923c', '#facc15', 
                     '#4ade80', '#2dd4bf', '#3b82f6', '#a855f7', '#f472b6'
                   ].map(c => (
                     <button
                       key={c}
                       onClick={() => setColor(c)}
                       className={`w-5 h-5 md:w-8 md:h-8 rounded-lg transition-transform border border-slate-400 active:scale-90 ${color === c ? 'scale-110 ring-2 ring-slate-850 ring-offset-2 ring-offset-white z-10' : 'hover:scale-105'}`}
                       style={{ backgroundColor: c }}
                       title={c}
                     />
                   ))}
                   {/* Custom Color Input */}
                   <div className="relative w-5 h-5 md:w-8 md:h-8 rounded-lg overflow-hidden border border-slate-400 bg-white">
                      <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 cursor-pointer w-full h-full p-0 border-0 transform scale-150"
                      />
                   </div>
                </div>

                <div className="h-8 w-[2px] bg-slate-300 hidden md:block"></div>

                {/* Brush Size Slider & Eraser */}
                <div className="flex items-center gap-3 px-2">
                   <div className="flex flex-col items-center">
                     <input 
                        type="range" 
                        min="1" 
                        max="30" 
                        value={brushSize} 
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-20 md:w-32 accent-amber-500 h-2 rounded-full appearance-none bg-slate-200 border border-slate-400 cursor-pointer"
                     />
                   </div>
                   <button 
                     onClick={() => socket.emit("clear_canvas", roomCode)}
                     className="p-2 md:p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border-2 border-rose-300 transition-all active:scale-90 shadow-[2px_2px_0px_0px_rgba(244,63,94,0.15)]"
                     title="Clear Board"
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
      <aside className="hidden md:flex w-80 lg:w-96 flex-col border-l-3 border-slate-800 bg-white z-30 shadow-md relative">
        <Sidebar />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div 
          className={`absolute inset-y-0 right-0 w-[85%] max-w-sm bg-white border-l-3 border-slate-800 shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-full flex flex-col pt-safe">
            <div className="p-4 flex items-center justify-between border-b-2 border-slate-200 bg-slate-50">
               <h3 className="text-xl font-black text-slate-800">Game Lobby</h3>
               <button 
                 onClick={() => setIsSidebarOpen(false)} 
                 className="p-2 bg-white border-2 border-slate-300 hover:border-slate-800 rounded-xl transition-all shadow-[2px_2px_0px_0px_#1e293b]"
               >
                  <X className="w-6 h-6 text-slate-800" />
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
