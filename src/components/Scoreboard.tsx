"use client";

import { useGameStore } from "@/store/useGameStore";
import { Award, Shield } from "lucide-react";

export const Scoreboard = () => {
  const { scores } = useGameStore();

  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900/40 backdrop-blur-md border-b border-white/5">
      <div className="relative group overflow-hidden p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 transition-all hover:bg-indigo-600/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Team A</span>
          <Shield className="w-4 h-4 text-indigo-500/50" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-black text-white">{scores.A}</p>
          <span className="text-[10px] font-bold text-slate-500 uppercase">pts</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600/5 rounded-full blur-xl group-hover:bg-indigo-600/10 transition-colors"></div>
      </div>

      <div className="relative group overflow-hidden p-4 bg-rose-600/10 rounded-2xl border border-rose-500/20 transition-all hover:bg-rose-600/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Team B</span>
          <Award className="w-4 h-4 text-rose-500/50" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-black text-white">{scores.B}</p>
          <span className="text-[10px] font-bold text-slate-500 uppercase">pts</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-rose-600/5 rounded-full blur-xl group-hover:bg-rose-600/10 transition-colors"></div>
      </div>
    </div>
  );
};
