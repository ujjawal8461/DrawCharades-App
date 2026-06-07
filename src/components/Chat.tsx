"use client";

import React, { useState, useEffect, useRef } from "react";
import { socket } from "@/socket/socket";
import { useGameStore } from "@/store/useGameStore";
import { Send, Lock, Sparkles } from "lucide-react";

interface Message {
  playerName: string;
  message: string;
  isSystem: boolean;
}

export const Chat = () => {
  const { roomCode, me, guessingTeam, currentDrawerId, gamePhase } = useGameStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("correct_guess", ({ playerName, movie }) => {
      setMessages((prev) => [
        ...prev,
        { playerName: "SYSTEM", message: `${playerName} guessed correctly: ${movie}!`, isSystem: true },
      ]);
    });

    socket.on("round_time_up", ({ movie }) => {
      setMessages((prev) => [
        ...prev,
        { playerName: "SYSTEM", message: `Time is up! The movie was: ${movie}`, isSystem: true },
      ]);
    });

    return () => {
      socket.off("new_message");
      socket.off("correct_guess");
      socket.off("round_time_up");
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !roomCode) return;

    socket.emit("submit_guess", {
      roomCode,
      playerName: me?.name || "Anonymous",
      message: input,
    });

    setInput("");
  };

  const isDrawer = me?.id === currentDrawerId;
  const isOnGuessingTeam = me?.team === guessingTeam;
  const canChat = gamePhase === "DRAWING" && isOnGuessingTeam && !isDrawer;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/20">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex flex-col ${msg.isSystem ? 'items-center py-2' : 'items-start animate-in slide-in-from-left-2 duration-200'}`}
          >
            {msg.isSystem ? (
              <div className="bg-emerald-50 border-2 border-emerald-500 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[2px_2px_0px_0px_#065f46]">
                 <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                 <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wide">{msg.message}</span>
              </div>
            ) : (
              <div className="max-w-[90%]">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 mb-0.5 block">{msg.playerName}</span>
                 <div className="bg-white border-2 border-slate-850 px-3.5 py-2 rounded-2xl rounded-tl-none shadow-[2px_2px_0px_0px_#1e293b]">
                    <p className="text-sm font-bold text-slate-800">{msg.message}</p>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50 border-t-2 border-slate-200">
        <form onSubmit={sendMessage} className="relative">
          <input
            type="text"
            disabled={!canChat}
            placeholder={
              gamePhase !== "DRAWING" ? "Waiting for round..." :
              isDrawer ? "Drawing - no talking! 🎨" :
              !isOnGuessingTeam ? "Waiting for your turn..." :
              "Type your guess..."
            }
            className={`w-full sketch-input border-2 border-slate-800 bg-white py-3 pl-4 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 transition-all ${!canChat ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!canChat || !input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
              canChat && input.trim() 
                ? 'bg-amber-400 border-slate-800 text-slate-800 shadow-[1px_1px_0px_0px_#1e293b] active:scale-95' 
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
          >
            {canChat ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
