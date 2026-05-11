"use client";

import { socket } from "@/socket/socket";
import { useGameStore } from "@/store/useGameStore";
import { useEffect } from "react";

export const GameController = () => {
  const setGameStatus = useGameStore((state) => state.setGameStatus);

  useEffect(() => {
    socket.on("game_started", ({ phase, options, drawerId, guessingTeam }) => {
      setGameStatus({ 
        gamePhase: phase, 
        movieOptions: options, 
        currentDrawerId: drawerId, 
        guessingTeam 
      });
    });

    socket.on("round_started", ({ movie, timer }) => {
      setGameStatus({ gamePhase: "DRAWING", currentMovie: movie });
    });

    socket.on("correct_guess", ({ playerName, movie }) => {
      setGameStatus({ gamePhase: "ROUND_END" });
    });

    socket.on("timer_update", (t) => {
      setGameStatus({ timer: t });
    });

    socket.on("votes_updated", (votes) => {
      setGameStatus({ votes });
    });

    return () => {
      socket.off("game_started");
      socket.off("round_started");
      socket.off("correct_guess");
      socket.off("timer_update");
      socket.off("votes_updated");
    };
  }, [setGameStatus]);

  return null;
};
