"use client";

import { useGameStore } from "@/store/useGameStore";
import { Scoreboard } from "./Scoreboard";
import { Chat } from "./Chat";

export const Sidebar = () => {
  const { roomCode, players, me } = useGameStore();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Info - Desktop Only */}
      <div className="hidden md:flex p-4 border-b border-gray-100 items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Room Code</p>
          <p className="text-xl font-bold text-indigo-600 font-mono uppercase">{roomCode}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Players</p>
          <p className="text-xl font-bold text-gray-800">{players.length}/10</p>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="shrink-0">
        <Scoreboard />
      </div>

      {/* Team Tabs / Info - Mobile Only */}
      <div className="md:hidden flex p-2 bg-gray-50 border-b border-gray-100 gap-2 overflow-x-auto no-scrollbar">
        {players.map(p => (
           <div key={p.id} className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${p.team === 'A' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
              {p.name} {p.id === me?.id ? ' (You)' : ''}
           </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0">
        <Chat />
      </div>
    </div>
  );
};
