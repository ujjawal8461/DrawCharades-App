"use client";

import { useGameStore } from "@/store/useGameStore";
import { Scoreboard } from "./Scoreboard";
import { Chat } from "./Chat";
import { Users, Hash, Shield, Award } from "lucide-react";

export const Sidebar = () => {
  const { roomCode, players, me } = useGameStore();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Info - Desktop Only */}
      <div className="hidden md:flex p-6 border-b-2 border-slate-200 items-center justify-between bg-slate-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
             <Hash className="w-3 h-3 text-sky-650" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Room Code</span>
          </div>
          <p className="text-2xl font-black text-slate-800 font-mono uppercase tracking-tighter leading-none">{roomCode}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1">
             <Users className="w-3 h-3 text-emerald-600" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Players</span>
          </div>
          <p className="text-2xl font-black text-slate-800 leading-none">{players.length}<span className="text-slate-400 text-sm font-bold ml-1">/10</span></p>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="shrink-0">
        <Scoreboard />
      </div>

      {/* Player List / Team Tabs */}
      <div className="p-4 border-b-2 border-slate-200 bg-slate-50/50 overflow-x-auto no-scrollbar">
         <div className="flex gap-2 min-w-max">
            {players.map(p => (
              <div 
                key={p.id} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border-2 transition-all ${
                  p.id === me?.id ? 'scale-105 shadow-[2px_2px_0px_0px_#1e293b] z-10' : 'hover:border-slate-450'
                } ${
                  p.team === 'A' 
                    ? 'bg-sky-50 border-sky-400 text-sky-800' 
                    : 'bg-rose-50 border-rose-400 text-rose-800'
                }`}
              >
                {p.team === 'A' ? <Shield className="w-3 h-3 text-sky-500" /> : <Award className="w-3 h-3 text-rose-500" />}
                <span>{p.name}</span>
                {p.id === me?.id && <span className="text-[8px] bg-slate-200 border border-slate-350 text-slate-700 px-1 rounded ml-1 uppercase font-bold">You</span>}
              </div>
            ))}
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        <Chat />
      </div>
    </div>
  );
};
