"use client";

import React, { useState, useEffect, useRef } from "react";
import { socket } from "@/socket/socket";
import { useGameStore } from "@/store/useGameStore";

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
        { playerName: "SYSTEM", message: `${playerName} guessed the movie: ${movie}!`, isSystem: true },
      ]);
    });

    return () => {
      socket.off("new_message");
      socket.off("correct_guess");
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
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

  // Only the team that is GUESSING can talk. 
  // The Drawer cannot talk.
  // The Opponent team can watch but not talk.
  const isDrawer = me?.id === currentDrawerId;
  const isOnGuessingTeam = me?.team === guessingTeam;
  const canChat = gamePhase === "DRAWING" && isOnGuessingTeam && !isDrawer;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.isSystem ? 'text-emerald-600 font-black italic text-center' : ''}`}>
            {!msg.isSystem && <span className="font-black text-gray-500 mr-2">{msg.playerName}:</span>}
            <span className={msg.isSystem ? "" : "text-gray-700 font-bold"}>{msg.message}</span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-2 border-t border-gray-200 bg-white">
        <input
          type="text"
          disabled={!canChat}
          placeholder={
            gamePhase !== "DRAWING" ? "Waiting for round..." :
            isDrawer ? "You are the drawer! Shhh!" :
            !isOnGuessingTeam ? "Wait for your turn to guess!" :
            "Type your guess..."
          }
          className={`w-full p-3 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none font-bold text-sm ${!canChat ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'text-gray-700'}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
};
