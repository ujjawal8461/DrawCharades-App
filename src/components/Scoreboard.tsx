"use client";

import { useGameStore } from "@/store/useGameStore";

export const Scoreboard = () => {
  const { scores } = useGameStore();

  return (
    <div className="grid grid-cols-2 gap-2 p-2 md:p-4 bg-gray-900 text-white border-b border-gray-800">
      <div className="text-center p-2 md:p-4 bg-blue-600/20 rounded-xl border border-blue-500/30">
        <p className="text-[8px] md:text-xs font-bold text-blue-400 uppercase tracking-widest">Team A</p>
        <p className="text-xl md:text-4xl font-black">{scores.A}</p>
      </div>
      <div className="text-center p-2 md:p-4 bg-rose-600/20 rounded-xl border border-rose-500/30">
        <p className="text-[8px] md:text-xs font-bold text-rose-400 uppercase tracking-widest">Team B</p>
        <p className="text-xl md:text-4xl font-black">{scores.B}</p>
      </div>
    </div>
  );
};
