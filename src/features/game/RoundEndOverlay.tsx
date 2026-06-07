"use client";

import { useGameStore } from "@/store/useGameStore";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export const RoundEndOverlay = () => {
  const { currentMovie, guessingTeam, scores } = useGameStore();
  
  useEffect(() => {
    // Blast some confetti for a party feel!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 p-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="sketch-panel p-8 md:p-12 bg-white border-4 border-slate-800 max-w-lg w-full shadow-[8px_8px_0px_0px_#1e293b] relative overflow-hidden">
        
        <h2 className="text-sm md:text-lg font-black text-amber-600 tracking-widest uppercase mb-2 handwritten">Round Finished!</h2>
        <h1 className="text-4xl md:text-6xl font-black text-slate-850 mb-6">
          {currentMovie}
        </h1>
        
        <div className="flex gap-4 justify-center mb-8">
           {/* Team A (Blue) */}
           <div className="flex flex-col items-center p-4 bg-sky-50 rounded-2xl border-2 border-sky-400 w-32 shadow-[3px_3px_0px_0px_#0369a1]">
              <span className="text-[10px] font-black text-sky-850 uppercase tracking-tighter">Team A</span>
              <span className="text-3xl font-black text-sky-950">{scores.A}</span>
           </div>
           {/* Team B (Red) */}
           <div className="flex flex-col items-center p-4 bg-rose-50 rounded-2xl border-2 border-rose-400 w-32 shadow-[3px_3px_0px_0px_#9f1239]">
              <span className="text-[10px] font-black text-rose-850 uppercase tracking-tighter">Team B</span>
              <span className="text-3xl font-black text-rose-950">{scores.B}</span>
           </div>
        </div>

        <div className="space-y-4">
           <p className="text-slate-500 font-bold italic animate-pulse handwritten text-lg">Preparing next round...</p>
           <div className="w-full h-3 bg-slate-100 border-2 border-slate-800 rounded-full overflow-hidden shadow-sm">
              <div className="h-full bg-amber-400 border-r-2 border-slate-800 animate-progress"></div>
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
};
