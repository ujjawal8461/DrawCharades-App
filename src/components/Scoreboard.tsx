"use client";

import { useGameStore } from "@/store/useGameStore";
import { Award, Shield } from "lucide-react";

export const Scoreboard = () => {
  const { scores } = useGameStore();

  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-amber-50/50 border-b-3 border-slate-800">
      {/* Team A (Blue) */}
      <div className="relative group overflow-hidden p-4 bg-sky-50 rounded-2xl border-2 border-sky-500 transition-all hover:translate-y-[-1px] shadow-[3px_3px_0px_0px_#0369a1]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black text-sky-800 uppercase tracking-widest">Team A</span>
          <Shield className="w-4 h-4 text-sky-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-black text-sky-950">{scores.A}</p>
          <span className="text-[10px] font-bold text-sky-700 uppercase">pts</span>
        </div>
      </div>

      {/* Team B (Red) */}
      <div className="relative group overflow-hidden p-4 bg-rose-50 rounded-2xl border-2 border-rose-500 transition-all hover:translate-y-[-1px] shadow-[3px_3px_0px_0px_#9f1239]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Team B</span>
          <Award className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-black text-rose-950">{scores.B}</p>
          <span className="text-[10px] font-bold text-rose-700 uppercase">pts</span>
        </div>
      </div>
    </div>
  );
};
