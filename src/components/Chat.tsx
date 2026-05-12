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
    <div className="flex flex-col h-full overflow-hidden">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex flex-col ${msg.isSystem ? 'items-center py-2' : 'items-start animate-in slide-in-from-left-2 duration-200'}`}
          >
            {msg.isSystem ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                 <Sparkles className="w-3 h-3 text-emerald-400" />
                 <span className="text-[10px] md:text-xs font-bold text-emerald-300 italic">{msg.message}</span>
              </div>
            ) : (
              <div className="max-w-[90%]">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 mb-0.5 block">{msg.playerName}</span>
                 <div className="bg-slate-800/80 border border-white/5 px-3 py-2 rounded-2xl rounded-tl-none shadow-sm">
                    <p className="text-sm font-medium text-slate-200">{msg.message}</p>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-950/40 border-t border-white/5">
        <form onSubmit={sendMessage} className="relative">
          <input
            type="text"
            disabled={!canChat}
            placeholder={
              gamePhase !== "DRAWING" ? "Waiting for round..." :
              isDrawer ? "You're drawing, no talking!" :
              !isOnGuessingTeam ? "Waiting for your turn..." :
              "Type your guess..."
            }
            className={`w-full bg-slate-800/50 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${!canChat ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20'}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!canChat || !input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${canChat && input.trim() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-90' : 'bg-slate-700 text-slate-500'}`}
          >
            {canChat ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
