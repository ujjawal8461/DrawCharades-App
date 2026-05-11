"use client";

import React, { useState } from "react";
import { socket } from "@/socket/socket";
import { useGameStore } from "@/store/useGameStore";

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
      <div className="flex flex-col gap-6 p-8 bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
            <p className="text-gray-500 text-sm">Join a room or create your own</p>
        </div>
        
        <div className="flex flex-col gap-4">
           <input
            type="text"
            placeholder="Enter your name"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-600 outline-none transition-all font-semibold"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
           
           <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3">
              <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Round Timer</label>
              <div className="flex gap-2">
                 {[
                   { label: '1m', val: 60 },
                   { label: '2m', val: 120 },
                   { label: '5m', val: 300 },
                   { label: '10m', val: 600 }
                 ].map(opt => (
                   <button 
                     key={opt.val}
                     onClick={() => setTimerDuration(opt.val)}
                     className={`flex-1 p-2 rounded-lg font-bold text-sm transition-all ${timerDuration === opt.val ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-100'}`}
                   >
                     {opt.label}
                   </button>
                 ))}
              </div>
              <button
                onClick={handleCreate}
                className="w-full p-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
              >
                Create Room
              </button>
           </div>

           <div className="relative flex items-center justify-center my-2">
              <div className="absolute h-[1px] w-full bg-gray-100"></div>
              <span className="relative px-3 bg-white text-gray-400 text-xs font-bold">OR JOIN</span>
           </div>

           <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-600 outline-none transition-all text-center font-mono font-bold tracking-widest uppercase"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <button
                onClick={handleJoin}
                className="w-full p-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
              >
                Join Game
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center border border-gray-100">
        <div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Room Code</p>
          <h2 className="text-4xl font-bold text-indigo-600 tracking-tight">{roomCode}</h2>
        </div>
        <div className="text-right">
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Players</p>
          <p className="text-3xl font-bold text-gray-900">{players.length}/10</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col gap-4 min-h-[350px]">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <h3 className="text-xl font-bold text-gray-800">Team A</h3>
            {me?.team === "B" && (
              <button onClick={switchTeam} className="text-xs font-bold text-indigo-600 hover:underline">Switch Team</button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {players.filter(p => p.team === "A").map(p => (
              <div key={p.id} className={`p-3 bg-white rounded-xl shadow-sm border ${p.id === socket.id ? 'border-indigo-600' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                  {p.id === useGameStore.getState().me?.id && isHost && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-bold">HOST</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col gap-4 min-h-[350px]">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <h3 className="text-xl font-bold text-gray-800">Team B</h3>
            {me?.team === "A" && (
              <button onClick={switchTeam} className="text-xs font-bold text-indigo-600 hover:underline">Switch Team</button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {players.filter(p => p.team === "B").map(p => (
              <div key={p.id} className={`p-3 bg-white rounded-xl shadow-sm border ${p.id === socket.id ? 'border-indigo-600' : 'border-gray-100'}`}>
                <span className="font-semibold">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isHost ? (
          <button 
            onClick={() => socket.emit("start_game", roomCode)}
            className="p-5 bg-indigo-600 text-white text-2xl font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            START GAME
          </button>
        ) : (
          <div className="p-5 bg-gray-100 rounded-2xl text-center text-gray-500 font-bold italic border border-gray-200">
            Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
};
