"use client";

import { useGameStore } from "@/store/useGameStore";
import { Scoreboard } from "./Scoreboard";
import { Chat } from "./Chat";
import { Users, Hash, Shield, Award } from "lucide-react";

export const Sidebar = () => {
  const { roomCode, players, me } = useGameStore();

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl">
      {/* Header Info - Desktop Only */}
      <div className="hidden md:flex p-6 border-b border-white/5 items-center justify-between bg-slate-950/20">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
             <Hash className="w-3 h-3 text-indigo-400" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Room Code</span>
          </div>
          <p className="text-2xl font-black text-white font-mono uppercase tracking-tighter leading-none">{roomCode}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1">
             <Users className="w-3 h-3 text-emerald-400" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Players</span>
          </div>
          <p className="text-2xl font-black text-white leading-none">{players.length}<span className="text-slate-600 text-sm font-bold ml-1">/10</span></p>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="shrink-0">
        <Scoreboard />
      </div>

      {/* Player List / Team Tabs */}
      <div className="p-4 border-b border-white/5 bg-slate-900/30 overflow-x-auto no-scrollbar">
         <div className="flex gap-2 min-w-max">
            {players.map(p => (
              <div 
                key={p.id} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                  p.id === me?.id ? 'scale-105 shadow-lg z-10' : 'opacity-80 hover:opacity-100'
                } ${
                  p.team === 'A' 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300' 
                    : 'bg-rose-600/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {p.team === 'A' ? <Shield className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                <span>{p.name}</span>
                {p.id === me?.id && <span className="text-[8px] bg-white/10 px-1 rounded ml-1 uppercase">You</span>}
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
