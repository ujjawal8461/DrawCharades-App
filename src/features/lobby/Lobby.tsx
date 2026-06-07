"use client";

import React, { useState } from "react";
import { socket } from "@/socket/socket";
import { useGameStore } from "@/store/useGameStore";
import { User, Hash, Play, SwitchCamera, Shield, Award, Clock } from "lucide-react";

export const Lobby = () => {
  const { roomCode, players, me, isHost } = useGameStore();
  const [playerName, setPlayerName] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [timerDuration, setTimerDuration] = useState(60);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  const handleCreate = () => {
    if (!playerName) return alert("Please enter your name");
    
    const data = { playerName, timerDuration };
    if (!socket.connected) {
      socket.connect();
      socket.once("connect", () => {
        socket.emit("create_room", data);
      });
    } else {
      socket.emit("create_room", data);
    }
  };

  const handleJoin = () => {
    if (!playerName || !inputCode) return alert("Please enter both name and room code");
    const data = { roomCode: inputCode.toUpperCase(), playerName };
    if (!socket.connected) {
      socket.connect();
      socket.once("connect", () => {
        socket.emit("join_room", data);
      });
    } else {
      socket.emit("join_room", data);
    }
  };

  const switchTeam = () => {
    socket.emit("switch_team", roomCode);
  };

  if (!roomCode) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in zoom-in-95 duration-500">
        {/* Tab Headers */}
        <div className="flex border-3 border-slate-800 rounded-2xl overflow-hidden bg-white shadow-[4px_4px_0px_0px_#1e293b]">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-3.5 text-sm font-black transition-all border-r-3 border-slate-800 ${
              activeTab === "create"
                ? "bg-emerald-400 text-slate-800"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            CREATE ROOM
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`flex-1 py-3.5 text-sm font-black transition-all ${
              activeTab === "join"
                ? "bg-rose-500 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            JOIN ROOM
          </button>
        </div>

        {/* Tab Body */}
        <div className="space-y-4">
           {/* Player Name Input (Needed for both) */}
           <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Your Rockstar Name"
                className="w-full pl-12 pr-4 py-4 sketch-input border-3 border-slate-800 text-slate-800 placeholder:text-slate-400 font-bold focus:ring-0"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
           </div>

           {activeTab === "create" ? (
             /* Create Room Form (Green theme) */
             <div className="p-6 bg-white rounded-3xl border-3 border-slate-800 space-y-4 shadow-[4px_4px_0px_0px_#1e293b] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                   <Clock className="w-4 h-4 text-emerald-700" />
                   <label className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] handwritten">Round Timer</label>
                </div>
                <div className="flex gap-2">
                   {[
                     { label: '1m', val: 60 },
                     { label: '1m 30s', val: 90 },
                     { label: '2m', val: 120 },
                     { label: '3m', val: 180 }
                   ].map(opt => (
                     <button 
                       key={opt.val}
                       onClick={() => setTimerDuration(opt.val)}
                       className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border-2 ${
                         timerDuration === opt.val 
                           ? 'bg-emerald-250 border-slate-800 text-emerald-950 shadow-[2px_2px_0px_0px_#1e293b]' 
                           : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-800'
                       }`}
                     >
                       {opt.label}
                     </button>
                   ))}
                </div>
                <button
                  onClick={handleCreate}
                  className="sketch-btn w-full py-4 text-emerald-950 font-black rounded-2xl flex items-center justify-center gap-2 text-lg group bg-emerald-450 border-emerald-800 shadow-[4px_4px_0px_0px_#065f46] hover:bg-emerald-500 transition-all"
                >
                  CREATE ROOM <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
           ) : (
             /* Join Room Form (Red theme) */
             <div className="p-6 bg-white rounded-3xl border-3 border-slate-800 space-y-4 shadow-[4px_4px_0px_0px_#1e293b] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="6-DIGIT CODE"
                    className="w-full pl-12 pr-4 py-4 sketch-input border-3 border-slate-800 text-center font-mono font-black tracking-[0.3em] uppercase text-slate-800 placeholder:text-slate-400"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleJoin}
                  className="sketch-btn w-full py-4 text-white font-black rounded-2xl flex items-center justify-center gap-2 group bg-rose-500 border-rose-800 shadow-[4px_4px_0px_0px_#9f1239] hover:bg-rose-600 transition-all"
                >
                  JOIN GAME <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
           )}
        </div>
      </div>
    );
  }

  const isStartDisabled = players.length < 4;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Room Details Banner */}
      <div className="sketch-panel p-6 rounded-3xl flex justify-between items-center bg-white border-3 border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
             <Hash className="w-3 h-3 text-sky-600" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Room Code</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{roomCode}</h2>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1">
             <User className="w-3 h-3 text-emerald-600" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Players</span>
          </div>
          <p className="text-3xl font-black text-slate-800 leading-none">
            {players.length}
            <span className="text-slate-400 text-sm font-bold ml-1">/10</span>
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Team A (Blue Team) */}
        <div className="sketch-panel-blue p-6 rounded-[2rem] flex flex-col gap-4 min-h-[300px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Shield className="w-24 h-24 text-sky-600" />
          </div>
          <div className="flex justify-between items-center border-b-2 border-sky-300 pb-4">
            <h3 className="text-xl font-black text-sky-800 flex items-center gap-2">
               <Shield className="w-5 h-5" /> TEAM A
            </h3>
            {me?.team === "B" && (
              <button 
                onClick={switchTeam} 
                className="text-[10px] font-black text-slate-600 hover:text-slate-800 uppercase tracking-widest flex items-center gap-1 bg-white border-2 border-slate-800 px-2.5 py-1 rounded-lg transition-all shadow-[2px_2px_0px_0px_#1e293b]"
              >
                <SwitchCamera className="w-3 h-3" /> Switch
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            {players.filter(p => p.team === "A").map(p => (
              <div 
                key={p.id} 
                className={`p-3 rounded-2xl border-2 transition-all ${
                  p.id === socket.id 
                    ? 'bg-sky-200 border-sky-500 text-sky-950 font-black shadow-[2px_2px_0px_0px_#1e293b]' 
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                  {p.id === me?.id && isHost && (
                    <span className="text-[8px] bg-amber-400 border border-slate-800 text-slate-800 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-[1px_1px_0px_0px_#1e293b]">
                      Host
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team B (Red Team) */}
        <div className="sketch-panel-red p-6 rounded-[2rem] flex flex-col gap-4 min-h-[300px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Award className="w-24 h-24 text-rose-600" />
          </div>
          <div className="flex justify-between items-center border-b-2 border-rose-300 pb-4">
            <h3 className="text-xl font-black text-rose-800 flex items-center gap-2">
               <Award className="w-5 h-5" /> TEAM B
            </h3>
            {me?.team === "A" && (
              <button 
                onClick={switchTeam} 
                className="text-[10px] font-black text-slate-600 hover:text-slate-800 uppercase tracking-widest flex items-center gap-1 bg-white border-2 border-slate-800 px-2.5 py-1 rounded-lg transition-all shadow-[2px_2px_0px_0px_#1e293b]"
              >
                <SwitchCamera className="w-3 h-3" /> Switch
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            {players.filter(p => p.team === "B").map(p => (
              <div 
                key={p.id} 
                className={`p-3 rounded-2xl border-2 transition-all ${
                  p.id === socket.id 
                    ? 'bg-rose-200 border-rose-500 text-rose-950 font-black shadow-[2px_2px_0px_0px_#1e293b]' 
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                  {p.id === me?.id && isHost && (
                    <span className="text-[8px] bg-amber-400 border border-slate-800 text-slate-800 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-[1px_1px_0px_0px_#1e293b]">
                      Host
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button or Wait Banner */}
      <div className="mt-4">
        {isHost ? (
          <button 
            disabled={isStartDisabled}
            onClick={() => socket.emit("start_game", roomCode)}
            className={`w-full py-5 text-2xl font-black rounded-[2rem] border-3 transition-all group flex items-center justify-center gap-2 ${
              isStartDisabled 
                ? 'bg-slate-200 text-slate-400 border-slate-400 cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(100,116,139,0.3)]' 
                : 'sketch-btn sketch-btn-yellow bg-amber-400 hover:bg-amber-500'
            }`}
          >
            {isStartDisabled ? (
              <span className="handwritten text-lg uppercase tracking-wider">
                Waiting for Players ({players.length}/4 Joined)
              </span>
            ) : (
              <>
                START THE SHOW 
                <Play className="inline-block ml-2 w-8 h-8 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        ) : (
          <div className="p-6 bg-amber-50 rounded-[2rem] border-3 border-amber-300 text-center flex flex-col items-center gap-2 shadow-[4px_4px_0px_0px_rgba(252,211,77,0.3)]">
             <div className="w-10 h-10 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin"></div>
             <p className="text-amber-800 font-bold uppercase tracking-[0.2em] text-xs">Waiting for host to start the show...</p>
          </div>
        )}
      </div>
    </div>
  );
};
