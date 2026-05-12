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

  const handleCreate = () => {
    if (!playerName) return alert("Enter name");
    
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
    if (!playerName || !inputCode) return alert("Enter name and code");
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
        <div className="space-y-4">
           <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Your Rockstar Name"
                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
           </div>
           
           <div className="p-6 bg-indigo-600/10 rounded-3xl border border-indigo-500/20 space-y-4 shadow-xl shadow-indigo-500/5">
              <div className="flex items-center gap-2 mb-2">
                 <Clock className="w-4 h-4 text-indigo-400" />
                 <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Round Timer</label>
              </div>
              <div className="flex gap-2">
                 {[
                   { label: '60s', val: 60 },
                   { label: '90s', val: 90 },
                   { label: '2m', val: 120 },
                   { label: '3m', val: 180 }
                 ].map(opt => (
                   <button 
                     key={opt.val}
                     onClick={() => setTimerDuration(opt.val)}
                     className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all border ${timerDuration === opt.val ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800'}`}
                   >
                     {opt.label}
                   </button>
                 ))}
              </div>
              <button
                onClick={handleCreate}
                className="btn-party w-full py-4 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-lg group"
              >
                CREATE ROOM <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           <div className="relative flex items-center justify-center py-2">
              <div className="absolute h-[1px] w-full bg-white/5"></div>
              <span className="relative px-4 bg-[#141d33] text-slate-500 text-[10px] font-black tracking-widest uppercase">Or Join Party</span>
           </div>

           <div className="space-y-3">
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="6-DIGIT CODE"
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none transition-all text-center font-mono font-black tracking-[0.3em] uppercase text-white placeholder:text-slate-600"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                />
              </div>
              <button
                onClick={handleJoin}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-2 group"
              >
                JOIN GAME <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel p-6 rounded-3xl flex justify-between items-center border-indigo-500/30">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
             <Hash className="w-3 h-3 text-indigo-400" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Room Code</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter leading-none">{roomCode}</h2>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 mb-1">
             <User className="w-3 h-3 text-emerald-400" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Players</span>
          </div>
          <p className="text-3xl font-black text-white leading-none">{players.length}<span className="text-slate-600 text-sm font-bold ml-1">/10</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Team A */}
        <div className="glass-panel p-6 rounded-[2rem] border-indigo-500/20 flex flex-col gap-4 min-h-[300px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Shield className="w-24 h-24 text-indigo-500" />
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xl font-black text-indigo-400 flex items-center gap-2">
               <Shield className="w-5 h-5" /> TEAM A
            </h3>
            {me?.team === "B" && (
              <button onClick={switchTeam} className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                <SwitchCamera className="w-3 h-3" /> Switch
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            {players.filter(p => p.team === "A").map(p => (
              <div key={p.id} className={`p-3 rounded-2xl border transition-all ${p.id === socket.id ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-slate-800/40 border-white/5'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                  {p.id === me?.id && isHost && <span className="text-[8px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Host</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="glass-panel p-6 rounded-[2rem] border-rose-500/20 flex flex-col gap-4 min-h-[300px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Award className="w-24 h-24 text-rose-500" />
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-xl font-black text-rose-400 flex items-center gap-2">
               <Award className="w-5 h-5" /> TEAM B
            </h3>
            {me?.team === "A" && (
              <button onClick={switchTeam} className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                <SwitchCamera className="w-3 h-3" /> Switch
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 relative z-10">
            {players.filter(p => p.team === "B").map(p => (
              <div key={p.id} className={`p-3 rounded-2xl border transition-all ${p.id === socket.id ? 'bg-rose-600/20 border-rose-500/50' : 'bg-slate-800/40 border-white/5'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                  {p.id === me?.id && isHost && <span className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Host</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {isHost ? (
          <button 
            onClick={() => socket.emit("start_game", roomCode)}
            className="btn-party w-full py-5 text-2xl font-black rounded-[2rem] shadow-2xl shadow-indigo-500/20 group"
          >
            START THE SHOW <Play className="inline-block ml-2 w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-2">
             <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Waiting for host to start...</p>
          </div>
        )}
      </div>
    </div>
  );
};
