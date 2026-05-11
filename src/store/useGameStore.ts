import { create } from "zustand";

interface Player {
  id: string;
  name: string;
  team: "A" | "B" | null;
}

interface RoomState {
  roomCode: string | null;
  players: Player[];
  me: Player | null;
  isHost: boolean;
  scores: { A: number; B: number };
  gamePhase: "LOBBY" | "SELECTING" | "DRAWING" | "ROUND_END";
  guessingTeam: "A" | "B" | null;
  currentDrawerId: string | null;
  currentMovie: string | null;
  movieOptions: string[];
  votes: Record<string, string[]>;
  timer: number;
  setRoom: (room: { code: string; players: Player[]; hostId: string; scores?: { A: number; B: number } }, myId: string) => void;
  setGameStatus: (status: Partial<RoomState>) => void;
  updateScores: (scores: { A: number; B: number }) => void;
  updatePlayers: (players: Player[]) => void;
  leaveRoom: () => void;
}

export const useGameStore = create<RoomState>((set) => ({
  roomCode: null,
  players: [],
  me: null,
  isHost: false,
  scores: { A: 0, B: 0 },
  gamePhase: "LOBBY",
  guessingTeam: null,
  currentDrawerId: null,
  currentMovie: null,
  movieOptions: [],
  votes: {},
  timer: 60,

  setRoom: (room, myId) => {
    const me = room.players.find((p) => p.id === myId) || null;
    if (myId) localStorage.setItem("drawCharades_playerId", myId);
    set({
      roomCode: room.code,
      players: room.players,
      me,
      isHost: room.hostId === myId,
      scores: room.scores || { A: 0, B: 0 },
    });
  },

  setGameStatus: (status) => set((state) => ({ ...state, ...status })),

  updateScores: (scores) => set({ scores }),

  updatePlayers: (players) => {
    set((state) => ({
      players,
      me: players.find((p) => p.id === state.me?.id) || state.me,
    }));
  },

  leaveRoom: () => set({ roomCode: null, players: [], me: null, isHost: false }),
}));
