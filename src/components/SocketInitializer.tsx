"use client";

import { useGameStore } from "@/store/useGameStore";
import { socket } from "@/socket/socket";
import { useEffect } from "react";

export const SocketInitializer = () => {
  const setRoom = useGameStore((state) => state.setRoom);

  useEffect(() => {
    // These listeners are ALWAYS active, from the moment the app loads
    socket.on("room_created", (room) => {
      console.log("Frontend: Room Created", room);
      if (socket.id) {
        setRoom(room, socket.id);
      } else {
        // Fallback if ID isn't ready yet
        setTimeout(() => socket.id && setRoom(room, socket.id), 100);
      }
    });

    socket.on("room_updated", (room) => {
      console.log("Frontend: Room Updated", room);
      if (socket.id) setRoom(room, socket.id);
    });

    socket.on("error", (msg) => {
      alert(msg);
    });

    return () => {
      socket.off("room_created");
      socket.off("room_updated");
      socket.off("error");
    };
  }, [setRoom]);

  return null;
};
