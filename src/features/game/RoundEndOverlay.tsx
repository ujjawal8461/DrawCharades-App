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
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border-2 border-primary/30 max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/20 blur-3xl rounded-full"></div>

        <h2 className="text-sm md:text-xl font-bold text-primary tracking-widest uppercase mb-2">Round Finished!</h2>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-sm">
          {currentMovie}
        </h1>
        
        <div className="flex gap-4 justify-center mb-8">
           <div className="flex flex-col items-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 w-32">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Team A</span>
              <span className="text-3xl font-black text-white">{scores.A}</span>
           </div>
           <div className="flex flex-col items-center p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20 w-32">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-tighter">Team B</span>
              <span className="text-3xl font-black text-white">{scores.B}</span>
           </div>
        </div>

        <div className="space-y-4">
           <p className="text-slate-400 font-medium italic animate-pulse">Preparing next round...</p>
           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress"></div>
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
